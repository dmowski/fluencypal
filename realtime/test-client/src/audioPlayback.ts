import { debugLog } from './debugLog.js';

export class Mp3PlaybackQueue {
  private chunks: Uint8Array[] = [];
  private audio: HTMLAudioElement | null = null;
  private playing = false;
  private onStateChange: (() => void) | null = null;

  get isPlaying(): boolean {
    return this.playing;
  }

  get hasPendingChunks(): boolean {
    return this.chunks.length > 0;
  }

  setOnStateChange(listener: (() => void) | null): void {
    this.onStateChange = listener;
  }

  append(chunk: ArrayBuffer): void {
    this.chunks.push(new Uint8Array(chunk));
    this.onStateChange?.();
  }

  async playCollected(): Promise<void> {
    if (this.chunks.length === 0) {
      return;
    }

    const blob = new Blob(this.chunks, { type: 'audio/mpeg' });
    this.chunks = [];
    this.onStateChange?.();

    if (this.audio) {
      this.audio.pause();
      URL.revokeObjectURL(this.audio.src);
    }

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    this.audio = audio;
    this.playing = true;
    this.onStateChange?.();

    try {
      await new Promise<void>((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(url);
          resolve();
        };
        audio.onerror = () => reject(new Error('Audio playback failed'));
        void audio.play().catch((error) => {
          debugLog('audio', 'playback_blocked', {
            message: error instanceof Error ? error.message : String(error),
          });
          reject(error);
        });
      });
    } finally {
      this.playing = false;
      this.audio = null;
      this.onStateChange?.();
    }
  }

  reset(): void {
    this.chunks = [];
    this.playing = false;
    if (this.audio) {
      this.audio.pause();
      URL.revokeObjectURL(this.audio.src);
      this.audio = null;
    }
    this.onStateChange?.();
  }
}
