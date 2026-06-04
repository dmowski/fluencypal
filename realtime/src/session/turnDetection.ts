import { estimateAudioDurationMs } from '../protocol/audioCodec.js';

export type TurnDetectorConfig = {
  silenceMs: number;
  rmsThreshold: number;
  minSpeechMs: number;
};

export const defaultTurnDetectorConfig: TurnDetectorConfig = {
  silenceMs: 1400,
  rmsThreshold: 420,
  minSpeechMs: 400,
};

/** Minimum buffered speech before running STT on a committed turn. */
export const MIN_USER_TURN_SPEECH_MS = 400;

export type TurnDetectorCallbacks = {
  onSpeechStart: () => void;
  onSpeechEnd: () => void;
  onTurnEnd: () => void;
};

export const computePcm16Rms = (pcm: Buffer): number => {
  const sampleCount = Math.floor(pcm.length / 2);
  if (sampleCount === 0) {
    return 0;
  }

  let sumSquares = 0;
  for (let i = 0; i < sampleCount; i++) {
    const sample = pcm.readInt16LE(i * 2);
    sumSquares += sample * sample;
  }

  return Math.sqrt(sumSquares / sampleCount);
};

export class RealtimeTurnDetector {
  private speaking = false;
  private speechStartedAt = 0;
  private lastSpeechAt = 0;
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly config: TurnDetectorConfig;

  constructor(config: TurnDetectorConfig = defaultTurnDetectorConfig) {
    this.config = config;
  }

  processChunk(pcm: Buffer, callbacks: TurnDetectorCallbacks): void {
    const rms = computePcm16Rms(pcm);
    const now = Date.now();
    const isSpeech = rms >= this.config.rmsThreshold;

    if (isSpeech) {
      if (!this.speaking) {
        this.speaking = true;
        this.speechStartedAt = now;
        callbacks.onSpeechStart();
      }

      this.lastSpeechAt = now;
      // Speech resumed — cancel pending end-of-turn timer.
      this.clearSilenceTimer();
      return;
    }

    // Mic keeps streaming during silence; arm the timer once, do not reset on every chunk.
    if (this.speaking && !this.silenceTimer) {
      this.armSilenceTimer(callbacks);
    }
  }

  reset(): void {
    this.clearSilenceTimer();
    this.speaking = false;
    this.speechStartedAt = 0;
    this.lastSpeechAt = 0;
  }

  private armSilenceTimer(callbacks: TurnDetectorCallbacks): void {
    this.clearSilenceTimer();

    this.silenceTimer = setTimeout(() => {
      if (!this.speaking) {
        return;
      }

      const speechDurationMs = this.lastSpeechAt - this.speechStartedAt;
      this.speaking = false;
      callbacks.onSpeechEnd();

      if (speechDurationMs >= this.config.minSpeechMs) {
        callbacks.onTurnEnd();
      }
    }, this.config.silenceMs);
  }

  private clearSilenceTimer(): void {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
  }
}

export const estimateBufferedSpeechMs = (chunks: Buffer[]): number => {
  const bytes = chunks.reduce((total, chunk) => total + chunk.length, 0);
  return estimateAudioDurationMs(bytes);
};

export const computeAverageRmsFromChunks = (chunks: Buffer[]): number => {
  if (chunks.length === 0) {
    return 0;
  }

  let sum = 0;
  for (const chunk of chunks) {
    sum += computePcm16Rms(chunk);
  }

  return sum / chunks.length;
};

export const hasMeaningfulBufferedSpeech = (
  chunks: Buffer[],
  options: { minMs?: number; minAvgRms?: number } = {},
): boolean => {
  const minMs = options.minMs ?? MIN_USER_TURN_SPEECH_MS;
  const minAvgRms = options.minAvgRms ?? defaultTurnDetectorConfig.rmsThreshold;

  if (estimateBufferedSpeechMs(chunks) < minMs) {
    return false;
  }

  return computeAverageRmsFromChunks(chunks) >= minAvgRms;
};
