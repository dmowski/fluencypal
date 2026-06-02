import { getPlaybackAudioContext, unlockAudioPlayback } from './audioUnlock';

export class Mp3PlaybackQueue {
  private chunks: Uint8Array[] = [];
  private htmlAudio: HTMLAudioElement | null = null;
  private webAudioSource: AudioBufferSourceNode | null = null;
  private playing = false;
  private onStateChange: (() => void) | null = null;
  private generation = 0;
  private volume = 1;

  get isPlaying(): boolean {
    return this.playing;
  }

  get hasPendingChunks(): boolean {
    return this.chunks.length > 0;
  }

  setOnStateChange(listener: (() => void) | null): void {
    this.onStateChange = listener;
  }

  setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.volume === 0) {
      this.cancel();
    }
  }

  append(chunk: ArrayBuffer): void {
    if (this.volume === 0) {
      return;
    }
    this.chunks.push(new Uint8Array(chunk));
  }

  cancel(): void {
    this.generation += 1;
    this.chunks = [];
    this.stopOutput();
    this.setPlaying(false);
  }

  async playCollected(): Promise<void> {
    if (this.chunks.length === 0 || this.volume === 0) {
      return;
    }

    const playGen = this.generation;
    const blob = new Blob(this.chunks as BlobPart[], { type: 'audio/mpeg' });
    this.chunks = [];

    if (playGen !== this.generation) {
      return;
    }

    await unlockAudioPlayback();

    if (playGen !== this.generation) {
      return;
    }

    this.setPlaying(true);

    try {
      const context = getPlaybackAudioContext();
      if (context) {
        try {
          await this.playWithWebAudio(context, blob, playGen);
          return;
        } catch {
          if (playGen !== this.generation) {
            return;
          }
        }
      }

      if (playGen !== this.generation) {
        return;
      }

      await this.playWithHtmlAudio(blob, playGen);
    } finally {
      if (playGen === this.generation) {
        this.setPlaying(false);
      }
    }
  }

  reset(): void {
    this.cancel();
  }

  private setPlaying(playing: boolean): void {
    if (this.playing === playing) {
      return;
    }

    this.playing = playing;
    this.onStateChange?.();
  }

  private stopOutput(): void {
    if (this.webAudioSource) {
      try {
        this.webAudioSource.stop();
      } catch {
        // Already stopped.
      }
      this.webAudioSource.disconnect();
      this.webAudioSource = null;
    }

    if (this.htmlAudio) {
      this.htmlAudio.pause();
      URL.revokeObjectURL(this.htmlAudio.src);
      this.htmlAudio = null;
    }
  }

  private async playWithWebAudio(
    context: AudioContext,
    blob: Blob,
    playGen: number,
  ): Promise<void> {
    if (context.state === 'suspended') {
      await context.resume();
    }

    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer.slice(0));

    if (playGen !== this.generation) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      const source = context.createBufferSource();
      this.webAudioSource = source;
      source.buffer = audioBuffer;

      const gain = context.createGain();
      gain.gain.value = this.volume;
      source.connect(gain);
      gain.connect(context.destination);

      source.onended = () => {
        if (this.webAudioSource === source) {
          this.webAudioSource = null;
        }
        resolve();
      };
      source.addEventListener('error', () => reject(new Error('Web Audio playback failed')), {
        once: true,
      });

      try {
        source.start(0);
      } catch (error) {
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  private async playWithHtmlAudio(blob: Blob, playGen: number): Promise<void> {
    this.stopOutput();

    if (playGen !== this.generation) {
      return;
    }

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.volume = this.volume;
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    this.htmlAudio = audio;

    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = () => reject(new Error('Audio playback failed'));
      void audio.play().catch(reject);
    });
  }
}
