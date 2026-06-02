import { debugLog } from './debugLog.js';
import { getPlaybackAudioContext, unlockAudioPlayback } from './audioUnlock.js';

export class Mp3PlaybackQueue {
  private chunks: Uint8Array[] = [];
  private htmlAudio: HTMLAudioElement | null = null;
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

    const totalBytes = this.chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const blob = new Blob(this.chunks, { type: 'audio/mpeg' });
    this.chunks = [];
    this.onStateChange?.();

    await unlockAudioPlayback();

    this.playing = true;
    this.onStateChange?.();

    try {
      const context = getPlaybackAudioContext();
      if (context) {
        try {
          await this.playWithWebAudio(context, blob, totalBytes);
          debugLog('audio', 'playback_done', { method: 'webaudio', bytes: totalBytes });
          return;
        } catch (error) {
          debugLog('audio', 'webaudio_failed', {
            message: error instanceof Error ? error.message : String(error),
            bytes: totalBytes,
          });
        }
      }

      await this.playWithHtmlAudio(blob, totalBytes);
      debugLog('audio', 'playback_done', { method: 'html_audio', bytes: totalBytes });
    } finally {
      this.playing = false;
      this.onStateChange?.();
    }
  }

  private async playWithWebAudio(
    context: AudioContext,
    blob: Blob,
    totalBytes: number,
  ): Promise<void> {
    if (context.state === 'suspended') {
      await context.resume();
    }

    const arrayBuffer = await blob.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer.slice(0));

    debugLog('audio', 'playback_start', {
      method: 'webaudio',
      bytes: totalBytes,
      durationSec: audioBuffer.duration,
      contextState: context.state,
    });

    await new Promise<void>((resolve, reject) => {
      const source = context.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(context.destination);
      source.onended = () => resolve();
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

  private async playWithHtmlAudio(blob: Blob, totalBytes: number): Promise<void> {
    if (this.htmlAudio) {
      this.htmlAudio.pause();
      URL.revokeObjectURL(this.htmlAudio.src);
    }

    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audio.setAttribute('playsinline', 'true');
    audio.setAttribute('webkit-playsinline', 'true');
    audio.playsInline = true;
    this.htmlAudio = audio;

    debugLog('audio', 'playback_start', { method: 'html_audio', bytes: totalBytes });

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
  }

  reset(): void {
    this.chunks = [];
    this.playing = false;
    if (this.htmlAudio) {
      this.htmlAudio.pause();
      URL.revokeObjectURL(this.htmlAudio.src);
      this.htmlAudio = null;
    }
    this.onStateChange?.();
  }
}
