const MOBILE_WARMUP_MS = 2500;
const DESKTOP_WARMUP_MS = 300;
const TARGET_SAMPLE_RATE = 24_000;

export const isMobileDevice = (): boolean =>
  /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const getCaptureWarmupMs = (): number => (isMobileDevice() ? MOBILE_WARMUP_MS : DESKTOP_WARMUP_MS);

const warmupCapture = async (): Promise<void> => {
  const delayMs = getCaptureWarmupMs();
  if (delayMs <= 0) {
    return;
  }

  await new Promise<void>((resolve) => {
    window.setTimeout(resolve, delayMs);
  });
};

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
  const slice = pcm.buffer.slice(pcm.byteOffset, pcm.byteOffset + pcm.byteLength);
  return slice as ArrayBuffer;
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

export type AudioCapture = {
  stop: () => void;
};

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

export const startMicCapture = async (
  stream: MediaStream,
  onChunk: (chunk: ArrayBuffer) => void,
): Promise<AudioCapture> => {
  await warmupCapture();

  const AudioContextCtor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  const context = new AudioContextCtor();
  if (context.state === 'suspended') {
    await context.resume();
  }

  const source = context.createMediaStreamSource(stream);

  if (canUseAudioWorklet(context)) {
    try {
      return await startWorkletCapture(context, source, onChunk);
    } catch {
      // Fall back below.
    }
  }

  return startScriptProcessorCapture(context, source, onChunk);
};
