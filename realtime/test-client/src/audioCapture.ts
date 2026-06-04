const MOBILE_WARMUP_MS = 2500;
const DESKTOP_WARMUP_MS = 300;

export const isMobileDevice = (): boolean =>
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export const getCaptureWarmupMs = (): number =>
  isMobileDevice() ? MOBILE_WARMUP_MS : DESKTOP_WARMUP_MS;

export const warmupCapture = async (): Promise<void> => {
  const delayMs = getCaptureWarmupMs();
  if (delayMs <= 0) {
    return;
  }

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, delayMs);
  });
};

export { unlockAudioPlayback } from './audioUnlock.js';

const TARGET_SAMPLE_RATE = 24_000;

/** Matches server `defaultTurnDetectorConfig.rmsThreshold`. */
export const BARGE_IN_RMS_THRESHOLD = 350;

export const computeChunkRms = (pcm: Int16Array): number => {
  if (pcm.length === 0) {
    return 0;
  }

  let sumSquares = 0;
  for (let i = 0; i < pcm.length; i++) {
    const sample = pcm[i] ?? 0;
    sumSquares += sample * sample;
  }

  return Math.sqrt(sumSquares / pcm.length);
};

export const computeChunkRmsFromBuffer = (chunk: ArrayBuffer): number =>
  computeChunkRms(new Int16Array(chunk));

const floatTo16BitPcm = (input: Float32Array): Int16Array => {
  const output = new Int16Array(input.length);
  for (let i = 0; i < input.length; i++) {
    const sample = Math.max(-1, Math.min(1, input[i] ?? 0));
    output[i] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
  }
  return output;
};

const resampleTo24k = (input: Float32Array, inputSampleRate: number): Int16Array => {
  if (inputSampleRate === TARGET_SAMPLE_RATE) {
    return floatTo16BitPcm(input);
  }

  const ratio = inputSampleRate / TARGET_SAMPLE_RATE;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const resampled = new Float32Array(outputLength);

  for (let i = 0; i < outputLength; i++) {
    const sourceIndex = Math.min(input.length - 1, Math.round(i * ratio));
    resampled[i] = input[sourceIndex] ?? 0;
  }

  return floatTo16BitPcm(resampled);
};

const pcmFromFloat = (channel: Float32Array, sampleRate: number): ArrayBuffer => {
  const pcm = resampleTo24k(channel, sampleRate);
  return pcm.buffer.slice(pcm.byteOffset, pcm.byteOffset + pcm.byteLength);
};

const WORKLET_SOURCE = `
class PcmCaptureProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const channel = inputs[0] && inputs[0][0];
    if (channel) {
      this.port.postMessage(channel);
    }
    return true;
  }
}
registerProcessor('pcm-capture', PcmCaptureProcessor);
`;

const canUseAudioWorklet = (context: AudioContext): boolean =>
  typeof context.audioWorklet !== 'undefined';

const startScriptProcessorCapture = (
  context: AudioContext,
  source: MediaStreamAudioSourceNode,
  onChunk: (chunk: ArrayBuffer) => void,
): AudioCapture => {
  const processor = context.createScriptProcessor(4096, 1, 1);
  const gain = context.createGain();
  gain.gain.value = 0;

  processor.onaudioprocess = (event) => {
    const channel = event.inputBuffer.getChannelData(0);
    onChunk(pcmFromFloat(channel, context.sampleRate));
  };

  source.connect(processor);
  processor.connect(gain);
  gain.connect(context.destination);

  return {
    stop: () => {
      processor.disconnect();
      source.disconnect();
      gain.disconnect();
      void context.close();
    },
  };
};

const startWorkletCapture = async (
  context: AudioContext,
  source: MediaStreamAudioSourceNode,
  onChunk: (chunk: ArrayBuffer) => void,
): Promise<AudioCapture> => {
  const blob = new Blob([WORKLET_SOURCE], { type: 'application/javascript' });
  const workletUrl = URL.createObjectURL(blob);
  await context.audioWorklet.addModule(workletUrl);
  URL.revokeObjectURL(workletUrl);

  const worklet = new AudioWorkletNode(context, 'pcm-capture');
  worklet.port.onmessage = (event: MessageEvent<Float32Array>) => {
    if (event.data instanceof Float32Array) {
      onChunk(pcmFromFloat(event.data, context.sampleRate));
    }
  };

  source.connect(worklet);

  return {
    stop: () => {
      worklet.disconnect();
      source.disconnect();
      void context.close();
    },
  };
};

export type AudioCapture = {
  stop: () => void;
};

export class MicrophoneSession {
  private stream: MediaStream | null = null;

  get isReady(): boolean {
    return this.stream !== null;
  }

  async requestAccess(): Promise<void> {
    if (this.stream) {
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error('Microphone is not available in this browser.');
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
      video: false,
    });
  }

  async startCapture(onChunk: (chunk: ArrayBuffer) => void): Promise<AudioCapture> {
    await warmupCapture();
    await this.requestAccess();

    if (!this.stream) {
      throw new Error('Microphone is not ready.');
    }

    const AudioContextCtor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    const context = new AudioContextCtor();
    if (context.state === 'suspended') {
      await context.resume();
    }

    const source = context.createMediaStreamSource(this.stream);

    if (canUseAudioWorklet(context)) {
      try {
        return await startWorkletCapture(context, source, onChunk);
      } catch {
        // Fall back below (Safari versions without worklet module support, etc.)
      }
    }

    return startScriptProcessorCapture(context, source, onChunk);
  }

  release(): void {
    this.stream?.getTracks().forEach((track) => track.stop());
    this.stream = null;
  }
}

export const describeMicError = (error: unknown): string => {
  if (error instanceof DOMException) {
    if (error.name === 'NotAllowedError') {
      return 'Microphone access was blocked. Allow mic access for this site in browser settings, then reload.';
    }
    if (error.name === 'NotFoundError') {
      return 'No microphone was found. Connect a mic and try again.';
    }
  }

  return error instanceof Error ? error.message : 'Microphone access failed.';
};
