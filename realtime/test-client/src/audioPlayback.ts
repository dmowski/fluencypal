export class Mp3PlaybackQueue {
  private chunks: Uint8Array[] = [];
  private audio: HTMLAudioElement | null = null;

  append(chunk: ArrayBuffer): void {
    this.chunks.push(new Uint8Array(chunk));
  }

  async playCollected(): Promise<void> {
    if (this.chunks.length === 0) {
      return;
    }

    const blob = new Blob(this.chunks, { type: 'audio/mpeg' });
    this.chunks = [];

    if (this.audio) {
      this.audio.pause();
      URL.revokeObjectURL(this.audio.src);
    }

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    this.audio = audio;

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = () => reject(new Error('Audio playback failed'));
      void audio.play().catch(reject);
    });
  }

  reset(): void {
    this.chunks = [];
    if (this.audio) {
      this.audio.pause();
      URL.revokeObjectURL(this.audio.src);
      this.audio = null;
    }
  }
}
