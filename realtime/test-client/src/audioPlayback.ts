import { debugLog } from './debugLog.js';
import { getPlaybackAudioContext, unlockAudioPlayback } from './audioUnlock.js';

export class Mp3PlaybackQueue {
  private chunks: Uint8Array[] = [];
  private htmlAudio: HTMLAudioElement | null = null;
  private webAudioSource: AudioBufferSourceNode | null = null;
  private playing = false;
  private onStateChange: (() => void) | null = null;
  /** Bumped on cancel — stale playCollected() calls exit without playing. */
  private generation = 0;

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
  }

  /** Stop in-flight output and discard buffered TTS (barge-in / new assistant turn). */
  cancel(): void {
    this.generation += 1;
    this.chunks = [];
    this.stopOutput();
    this.setPlaying(false);
    debugLog('audio', 'playback_cancelled');
  }

  async playCollected(): Promise<void> {
    if (this.chunks.length === 0) {
      return;
    }

    const playGen = this.generation;
    const totalBytes = this.chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const blob = new Blob(this.chunks, { type: 'audio/mpeg' });
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
          await this.playWithWebAudio(context, blob, totalBytes, playGen);
          if (playGen === this.generation) {
            debugLog('audio', 'playback_done', { method: 'webaudio', bytes: totalBytes });
          }
          return;
        } catch (error) {
          if (playGen !== this.generation) {
            return;
          }
          debugLog('audio', 'webaudio_failed', {
            message: error instanceof Error ? error.message : String(error),
            bytes: totalBytes,
          });
        }
      }

      if (playGen !== this.generation) {
        return;
      }

      await this.playWithHtmlAudio(blob, totalBytes, playGen);
      if (playGen === this.generation) {
        debugLog('audio', 'playback_done', { method: 'html_audio', bytes: totalBytes });
      }
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
    totalBytes: number,
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

    debugLog('audio', 'playback_start', {
      method: 'webaudio',
      bytes: totalBytes,
      durationSec: Math.round(audioBuffer.duration * 10) / 10,
    });

    await new Promise<void>((resolve, reject) => {
      const source = context.createBufferSource();
      this.webAudioSource = source;
      source.buffer = audioBuffer;
      source.connect(context.destination);
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

  private async playWithHtmlAudio(blob: Blob, totalBytes: number, playGen: number): Promise<void> {
    this.stopOutput();

    if (playGen !== this.generation) {
      return;
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
}
