'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  ReactNode,
  JSX,
} from 'react';
import { AiVoice } from '@/common/ai';
import { isSilentAudio } from './isSilentAudio';
import { isDev } from '../Analytics/isDev';
import { showDebugInfoBadgeOnTopWindow } from '../Conversation/useAiConversation/showDebugInfoBadgeOnTopWindow';

/**
 * What this gives you:
 * - initAudio(): MUST be called from the button click handler (user gesture).
 *   This unlocks AudioContext on mobile.
 * - speak(): generates TTS audio url, fetches bytes, decodes, and queues it for gapless playback.
 * - interrupt(): hard cut, immediately stops queued/current audio.
 * - interruptWithFade(): nicer cut (recommended for switching direction).
 * - setVolume(): adjust volume via gain node.
 *
 * Notes:
 * - You can call speak() many times; it will schedule chunks back-to-back.
 * - Works best with mp3/m4a/wav. iOS is safest with mp3/m4a.
 */

export type SpeakOptions = {
  instructions: string;
  voice: AiVoice;
  /**
   * Optional: if you already have a URL, you can pass it and skip TTS generation.
   */
  audioUrl?: string;
  cache?: boolean;
  regenerateCache?: boolean;
};

interface ConversationAudioContextType {
  /** Call from the user's "Start Conversation" button click. */
  initAudio: () => Promise<void>;

  /** True after audio has been unlocked at least once. */
  isUnlocked: () => boolean;

  /** Generate TTS and enqueue it, or enqueue provided audioUrl. */
  speak: (text: string, opts: SpeakOptions) => Promise<void>;

  initCache: (
    text: string,
    opts: SpeakOptions,
    attempt?: number,
    skipSilentCheck?: boolean,
  ) => Promise<boolean>;

  setTextAsPotentialSpeak: (text: string, opts: SpeakOptions) => Promise<void>;
  /** Stop everything immediately and clear queue. */
  interrupt: () => void;

  /** Fade out quickly, then stop+clear queue. */
  interruptWithFade: (ms?: number) => Promise<void>;

  /** Optional helpers */
  setVolume: (value01: number) => void;
  getVolume: () => number;

  music: {
    play: (url?: string) => Promise<void>;
    pause: () => void;
    stop: () => void;
    setVolume: (v01: number) => void;
    getVolume: () => number;
    setEnabled: (on: boolean) => void;
    isPlaying: boolean;
  };

  /** When user navigates away, you can release audio resources. */
  dispose: () => void;

  isPlaying: boolean;
}

const ConversationAudioContext = createContext<ConversationAudioContextType | null>(null);
const DEFAULT_BG_MUSIC_URL = '/audio/background.mp3';

function toMusicProxyUrl(url: string): string {
  if (!url.startsWith('https://')) {
    return url;
  }

  return `/api/proxyMedia?url=${encodeURIComponent(url)}`;
}

class AudioQueuePlayer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private speechGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  private unlocked = false;

  // Stream playback
  private speechEl: HTMLAudioElement | null = null;
  private speechNode: MediaElementAudioSourceNode | null = null;
  private speechVolume = 1;

  private musicEl: HTMLAudioElement | null = null;
  private musicNode: MediaElementAudioSourceNode | null = null;
  private musicBaseVolume = 1;
  private musicEnabled = true;
  private currentMusicUrl: string | null = null;

  // Track real playing state based on audio events
  private _speechPlaying = false;
  private _musicPlaying = false;
  private potentialSpeakUrl: string | null = null;

  async unlockFromGesture(): Promise<void> {
    if (!this.ctx) {
      const Ctx = (window.AudioContext ||
        (window as any).webkitAudioContext) as typeof AudioContext;
      this.ctx = new Ctx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 1;
      this.masterGain.connect(this.ctx.destination);

      this.speechGain = this.ctx.createGain();
      this.speechGain.gain.value = this.speechVolume;
      this.speechGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicBaseVolume;
      this.musicGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    // Create speech element + connect it to gain (so fade/volume works)
    if (!this.speechEl) {
      const el = new Audio();
      el.preload = 'auto';
      this.speechNode = this.ctx!.createMediaElementSource(el);
      this.speechNode.connect(this.speechGain!);
      this.speechEl = el;

      // Listen to real speech playback events
      el.addEventListener('playing', () => {
        this._speechPlaying = true;
      });
      el.addEventListener('waiting', () => {
        this._speechPlaying = false;
      });
      el.addEventListener('pause', () => {
        this._speechPlaying = false;
      });
      el.addEventListener('ended', () => {
        this._speechPlaying = false;
      });
    }

    if (!this.musicEl) {
      const el = new Audio();
      el.preload = 'auto';
      el.loop = true;
      this.musicNode = this.ctx!.createMediaElementSource(el);
      this.musicNode.connect(this.musicGain!);
      this.musicEl = el;

      // Listen to real music playback events
      el.addEventListener('playing', () => {
        this._musicPlaying = true;
      });
      el.addEventListener('waiting', () => {
        this._musicPlaying = false;
      });
      el.addEventListener('pause', () => {
        this._musicPlaying = false;
      });
      el.addEventListener('ended', () => {
        this._musicPlaying = false;
      });
    }

    this.unlocked = true;
  }

  isUnlocked(): boolean {
    return this.unlocked && !!this.ctx && this.ctx.state !== 'closed';
  }

  private ensureUnlocked(): void {
    if (!this.ctx || !this.speechGain || !this.musicGain || !this.speechEl || !this.musicEl) {
      throw new Error('AudioQueuePlayer: not unlocked. Call unlockFromGesture() first.');
    }
  }

  setVolume(value01: number) {
    const v = Math.min(1, Math.max(0, value01));
    this.speechVolume = v;
    if (!this.speechGain) return;
    this.speechGain.gain.value = v;
  }

  getVolume(): number {
    return this.speechVolume;
  }

  async setTextAsPotentialSpeak(url: string): Promise<void> {
    if (this.potentialSpeakUrl === url) {
      return;
    }
    this.ensureUnlocked();
    const ctx = this.ctx!;
    const el = this.speechEl!;

    if (ctx.state === 'suspended') await ctx.resume();

    await this.waitForCurrentAudioToEnd();
    this.potentialSpeakUrl = url;

    this.stopStream();
    el.src = this.potentialSpeakUrl;
    el.load();
  }

  async playStreamUrl(url: string): Promise<void> {
    this.ensureUnlocked();
    const ctx = this.ctx!;
    const el = this.speechEl!;

    if (ctx.state === 'suspended') await ctx.resume();

    // Stop previous audio instantly
    if (!this.potentialSpeakUrl || this.potentialSpeakUrl !== url) {
      this.stopStream();
      el.src = url;
    }
    this.potentialSpeakUrl = null;

    // Plays as soon as buffered enough (streaming)
    try {
      await el.play();
    } catch (error) {
      if (isAbortError(error)) return;
      throw error;
    }

    await new Promise<void>((resolve, reject) => {
      const onEnded = () => cleanup(resolve);
      const onError = () =>
        cleanup(() => {
          if (isAbortError(el.error)) return resolve();
          reject(new Error('Stream audio error'));
        });

      const cleanup = (done: () => void) => {
        el.removeEventListener('ended', onEnded);
        el.removeEventListener('error', onError);
        done();
      };

      el.addEventListener('ended', onEnded);
      el.addEventListener('error', onError);
    });
  }

  stopStream(): void {
    const el = this.speechEl;
    if (!el) return;
    this._speechPlaying = false;
    try {
      el.pause();
      el.currentTime = 0;
      el.removeAttribute('src');
      el.load();
    } catch {}
  }

  waitForCurrentAudioToEnd(): Promise<void> {
    const el = this.speechEl;
    if (!el) return Promise.resolve();
    if (el.paused) return Promise.resolve();
    return new Promise<void>((resolve) => {
      const onEnded = () => {
        el.removeEventListener('ended', onEnded);
        resolve();
      };
      el.addEventListener('ended', onEnded);
    });
  }

  interrupt(): void {
    this.stopStream();
  }

  async interruptWithFade(ms = 120): Promise<void> {
    if (!this.ctx || !this.speechGain) {
      this.interrupt();
      return;
    }
    if (this.ctx.state === 'suspended') await this.ctx.resume();

    const now = this.ctx.currentTime;
    const g = this.speechGain.gain;

    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0.0001, now + ms / 1000);

    await new Promise<void>((r) => setTimeout(r, ms + 20));

    this.stopStream();

    const t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(this.speechVolume, t);
  }

  async playMusicUrl(url: string, opts: { loop?: boolean; restart?: boolean } = {}): Promise<void> {
    this.ensureUnlocked();
    const ctx = this.ctx!;
    const el = this.musicEl!;

    if (ctx.state === 'suspended') await ctx.resume();

    const { loop = true, restart = false } = opts;

    if (!restart && this.currentMusicUrl === url && el.src) {
      el.loop = loop;
      if (this.musicEnabled && el.paused) {
        try {
          await el.play();
        } catch (error) {
          if (isAbortError(error)) return;
          throw error;
        }
      }
      return;
    }

    el.pause();
    el.currentTime = 0;
    el.src = url;
    el.loop = loop;
    this.currentMusicUrl = url;
    this.musicGain!.gain.value = this.musicBaseVolume;

    if (!this.musicEnabled) {
      return;
    }

    try {
      await el.play();
    } catch (error) {
      if (isAbortError(error)) return;
      throw error;
    }
  }

  pauseMusic(): void {
    const el = this.musicEl;
    if (!el) return;
    this._musicPlaying = false;
    try {
      el.pause();
    } catch {}
  }

  stopMusic(): void {
    const el = this.musicEl;
    if (!el) return;
    this._musicPlaying = false;
    this.currentMusicUrl = null;
    try {
      el.pause();
      el.currentTime = 0;
      el.removeAttribute('src');
      el.load();
    } catch {}
  }

  setMusicVolume(value01: number): void {
    const v = Math.min(1, Math.max(0, value01));
    this.musicBaseVolume = v;
    if (!this.musicGain) return;
    this.musicGain.gain.value = this.musicEnabled ? this.musicBaseVolume : 0;
  }

  getMusicVolume(): number {
    return this.musicBaseVolume;
  }

  isMusicPlaying(): boolean {
    return this._musicPlaying;
  }

  setMusicEnabled(enabled: boolean): void {
    this.musicEnabled = enabled;
    if (!this.musicGain) return;

    if (!enabled) {
      this.musicGain.gain.value = 0;
      this.pauseMusic();
      return;
    }

    this.musicGain.gain.value = this.musicBaseVolume;

    if (this.musicEl && this.musicEl.src) {
      this.musicEl.play().catch((error) => {
        if (!isAbortError(error)) {
          throw error;
        }
      });
    }
  }

  dispose(): void {
    this.interrupt();
    this.stopMusic();

    this.speechNode?.disconnect();
    this.musicNode?.disconnect();
    this.speechGain?.disconnect();
    this.musicGain?.disconnect();
    this.masterGain?.disconnect();

    if (this.ctx && this.ctx.state !== 'closed') {
      this.ctx.close().catch(() => {});
    }

    this.ctx = null;
    this.masterGain = null;
    this.speechGain = null;
    this.musicGain = null;
    this.speechNode = null;
    this.speechEl = null;
    this.musicNode = null;
    this.musicEl = null;
    this.unlocked = false;
    this.currentMusicUrl = null;
    this._speechPlaying = false;
    this._musicPlaying = false;
  }

  isPlaying(): boolean {
    return this._speechPlaying;
  }
}

function isAbortError(error: unknown): boolean {
  if (!error) return false;
  const name = (error as { name?: string }).name;
  return name === 'AbortError';
}

function useProvideConversationAudio(): ConversationAudioContextType {
  const playerRef = useRef<AudioQueuePlayer | null>(null);
  if (!playerRef.current) {
    playerRef.current = new AudioQueuePlayer();
  }

  const initAudio = useCallback(async () => {
    // MUST be called from a user gesture handler (button click/tap)
    await playerRef.current!.unlockFromGesture();
  }, []);

  const isUnlocked = useCallback(() => {
    return playerRef.current!.isUnlocked();
  }, []);

  const generateTtsStreamUrl = (text: string, opts: SpeakOptions) => {
    const maxLength = 600;
    text = text.trim();
    const trimmedText = text.length > maxLength ? text.slice(0, maxLength) : text;

    const versionSalt = 'v4';
    const q = new URLSearchParams({
      input: trimmedText,
      voice: opts.voice,
      instructions: opts.instructions ?? '',
      cache: opts.cache ? 'true' : 'false',
      regenerateCache: opts.regenerateCache ? 'true' : 'false',
      version: versionSalt,
    });

    return `/api/ttsStream?${q}`;
  };

  const speak = useCallback(async (text: string, opts: SpeakOptions) => {
    const url = generateTtsStreamUrl(text, opts);

    await playerRef.current!.playStreamUrl(url);
  }, []);

  const setTextAsPotentialSpeak = useCallback(async (text: string, opts: SpeakOptions) => {
    const url = generateTtsStreamUrl(text, opts);
    await playerRef.current!.setTextAsPotentialSpeak(url);
  }, []);

  const initCache = useCallback(
    async (
      text: string,
      opts: SpeakOptions,
      attempt = 0,
      skipSilentCheck = false,
    ): Promise<boolean> => {
      const urlClean = generateTtsStreamUrl(text, { ...opts, regenerateCache: false });
      const urlForRegenerate = generateTtsStreamUrl(text, { ...opts, regenerateCache: true });

      const urlForAttempt = attempt === 0 ? urlClean : urlForRegenerate;
      const urlWithSalt = urlForAttempt + '&date=' + Date.now();

      if (skipSilentCheck) {
        try {
          const responseClean = await fetch(urlClean);
          if (!responseClean.ok) {
            throw new Error('Failed to fetch audio for caching. clean attempt');
          }
        } catch (error) {
          console.error('Error initializing audio cache (clean attempt)', error);
        }

        return true;
      }

      try {
        const response = await fetch(urlWithSalt);
        if (!response.ok) {
          throw new Error('Failed to fetch audio for caching');
        }

        const buffer = await response.arrayBuffer();
        const silent = await isSilentAudio(buffer);

        const maxAttempts = isDev() ? 10 : 5;
        if (silent) {
          console.log(`Audio is silent. NEED Regenerate. |${text}| Attempt: ${attempt + 1}`);
          if (attempt < maxAttempts) {
            console.log('Retrying...', attempt + 1);
            return await initCache(text, opts, attempt + 1, skipSilentCheck);
          } else {
            console.log('Audio is NOT silent', text);
            return false;
          }
        }

        const responseClean = await fetch(urlClean);

        if (!responseClean.ok) {
          throw new Error('Failed to fetch audio for caching. clean attempt');
        }

        return true;
        // We don't need to do anything with the response; just fetching it should cache it
      } catch (error) {
        console.error('Error initializing audio cache:', error);
        return false;
      }
    },
    [],
  );

  const interrupt = useCallback(() => {
    playerRef.current!.interrupt();
  }, []);

  const interruptWithFade = useCallback(async (ms = 120) => {
    await playerRef.current!.interruptWithFade(ms);
  }, []);

  const setVolume = useCallback((value01: number) => {
    playerRef.current!.setVolume(value01);
  }, []);

  const getVolume = useCallback(() => {
    return playerRef.current!.getVolume();
  }, []);

  const playMusic = useCallback(async (url?: string) => {
    const sourceUrl = url ?? DEFAULT_BG_MUSIC_URL;
    await playerRef.current!.playMusicUrl(toMusicProxyUrl(sourceUrl));
  }, []);

  const pauseMusic = useCallback(() => {
    playerRef.current!.pauseMusic();
  }, []);

  const stopMusic = useCallback(() => {
    playerRef.current!.stopMusic();
  }, []);

  const setMusicVolume = useCallback((value01: number) => {
    playerRef.current!.setMusicVolume(value01);
  }, []);

  const getMusicVolume = useCallback(() => {
    return playerRef.current!.getMusicVolume();
  }, []);

  const setMusicEnabled = useCallback((enabled: boolean) => {
    playerRef.current!.setMusicEnabled(enabled);
  }, []);

  const dispose = useCallback(() => {
    playerRef.current!.dispose();
  }, []);

  const isPlayingChecker = useCallback(() => {
    return playerRef.current!.isPlaying();
  }, []);

  const isMusicPlayingChecker = useCallback(() => {
    return playerRef.current!.isMusicPlaying();
  }, []);

  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const playing = isPlayingChecker();
      const musicPlaying = isMusicPlayingChecker();
      setIsPlaying(playing);
      setIsMusicPlaying(musicPlaying);
    }, 100);

    return () => {
      clearInterval(interval);
    };
  }, [isPlayingChecker, isMusicPlayingChecker]);

  const music = useMemo(
    () => ({
      play: playMusic,
      pause: pauseMusic,
      stop: stopMusic,
      setVolume: setMusicVolume,
      getVolume: getMusicVolume,
      setEnabled: setMusicEnabled,
      isPlaying: isMusicPlaying,
    }),
    [
      playMusic,
      pauseMusic,
      stopMusic,
      setMusicVolume,
      getMusicVolume,
      setMusicEnabled,
      isMusicPlaying,
    ],
  );

  return useMemo(
    () => ({
      initAudio,
      isUnlocked,
      speak,
      interrupt,
      interruptWithFade,
      setVolume,
      getVolume,
      music,
      dispose,
      isPlaying,
      initCache,
      setTextAsPotentialSpeak,
    }),
    [
      initAudio,
      isUnlocked,
      speak,
      interrupt,
      interruptWithFade,
      setVolume,
      getVolume,
      music,
      dispose,
      isPlaying,
      initCache,
      setTextAsPotentialSpeak,
    ],
  );
}

export function ConversationAudioProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideConversationAudio();
  return (
    <ConversationAudioContext.Provider value={hook}>{children}</ConversationAudioContext.Provider>
  );
}

export const useConversationAudio = (): ConversationAudioContextType => {
  const context = useContext(ConversationAudioContext);
  if (!context) {
    throw new Error('useConversationAudio must be used within a ConversationAudioProvider');
  }
  return context;
};
