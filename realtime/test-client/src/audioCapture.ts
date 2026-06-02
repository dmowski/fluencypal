const TARGET_SAMPLE_RATE = 24_000;

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
    await this.requestAccess();

    if (!this.stream) {
      throw new Error('Microphone is not ready.');
    }

    const context = new AudioContext();
    if (context.state === 'suspended') {
      await context.resume();
    }

    const source = context.createMediaStreamSource(this.stream);
    const processor = context.createScriptProcessor(4096, 1, 1);
    const gain = context.createGain();
    gain.gain.value = 0;

    processor.onaudioprocess = (event) => {
      const channel = event.inputBuffer.getChannelData(0);
      const pcm = resampleTo24k(channel, context.sampleRate);
      onChunk(pcm.buffer);
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
