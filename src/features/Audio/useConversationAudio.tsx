"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  ReactNode,
  JSX,
} from "react";
import { useSettings } from "../Settings/useSettings";
import { useAuth } from "../Auth/useAuth";
import { sendTextToAudioRequest } from "@/app/api/textToAudio/sendTextToAudioRequest";
import { AiVoice } from "@/common/ai";

/**
 * What this gives you:
 * - startConversationAudio(): MUST be called from the "Start Conversation" button click handler (user gesture).
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

type SpeakOptions = {
  instructions: string;
  voice: AiVoice;
  /**
   * Optional: if you already have a URL, you can pass it and skip TTS generation.
   */
  audioUrl?: string;
};

interface ConversationAudioContextType {
  /** Call from the user's "Start Conversation" button click. */
  startConversationAudio: () => Promise<void>;

  /** True after audio has been unlocked at least once. */
  isUnlocked: () => boolean;

  /** Generate TTS and enqueue it, or enqueue provided audioUrl. */
  speak: (text: string, opts: SpeakOptions) => Promise<void>;

  /** Stop everything immediately and clear queue. */
  interrupt: () => void;

  /** Fade out quickly, then stop+clear queue. */
  interruptWithFade: (ms?: number) => Promise<void>;

  /** Optional helpers */
  setVolume: (value01: number) => void;
  getVolume: () => number;

  /** When user navigates away, you can release audio resources. */
  dispose: () => void;

  isPlaying: boolean;
}

const ConversationAudioContext =
  createContext<ConversationAudioContextType | null>(null);

class AudioQueuePlayer {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;

  private unlocked = false;

  // Stream playback
  private streamEl: HTMLAudioElement | null = null;
  private streamNode: MediaElementAudioSourceNode | null = null;

  // Track real playing state based on audio events
  private _isPlaying = false;

  async unlockFromGesture(): Promise<void> {
    if (!this.ctx) {
      const Ctx = (window.AudioContext ||
        (window as any).webkitAudioContext) as typeof AudioContext;
      this.ctx = new Ctx();
      this.gain = this.ctx.createGain();
      this.gain.gain.value = 1;
      this.gain.connect(this.ctx.destination);
    }

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    // Create audio element + connect it to gain (so fade/volume works)
    if (!this.streamEl) {
      const el = new Audio();
      el.preload = "auto";
      this.streamNode = this.ctx!.createMediaElementSource(el);
      this.streamNode.connect(this.gain!);
      this.streamEl = el;

      // Listen to real audio playback events
      el.addEventListener("playing", () => {
        this._isPlaying = true;
      });
      el.addEventListener("waiting", () => {
        this._isPlaying = false;
      });
      el.addEventListener("pause", () => {
        this._isPlaying = false;
      });
      el.addEventListener("ended", () => {
        this._isPlaying = false;
      });
    }

    this.unlocked = true;
  }

  isUnlocked(): boolean {
    return this.unlocked && !!this.ctx && this.ctx.state !== "closed";
  }

  setVolume(value01: number) {
    if (!this.gain) return;
    const v = Math.min(1, Math.max(0, value01));
    this.gain.gain.value = v;
  }

  getVolume(): number {
    return this.gain?.gain.value ?? 1;
  }

  async playStreamUrl(url: string): Promise<void> {
    if (!this.ctx || !this.gain || !this.streamEl) {
      throw new Error(
        "AudioQueuePlayer: not unlocked. Call unlockFromGesture() first.",
      );
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();

    // Stop previous audio instantly
    this.stopStream();

    const el = this.streamEl;
    el.src = url;

    // Plays as soon as buffered enough (streaming)
    await el.play();

    await new Promise<void>((resolve, reject) => {
      const onEnded = () => cleanup(resolve);
      const onError = () =>
        cleanup(() => reject(new Error("Stream audio error")));

      const cleanup = (done: () => void) => {
        el.removeEventListener("ended", onEnded);
        el.removeEventListener("error", onError);
        done();
      };

      el.addEventListener("ended", onEnded);
      el.addEventListener("error", onError);
    });
  }

  stopStream(): void {
    const el = this.streamEl;
    if (!el) return;
    this._isPlaying = false;
    try {
      el.pause();
      el.currentTime = 0;
      el.removeAttribute("src");
      el.load();
    } catch {}
  }

  interrupt(): void {
    this.stopStream();
  }

  async interruptWithFade(ms = 120): Promise<void> {
    if (!this.ctx || !this.gain) {
      this.interrupt();
      return;
    }
    if (this.ctx.state === "suspended") await this.ctx.resume();

    const now = this.ctx.currentTime;
    const g = this.gain.gain;

    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0.0001, now + ms / 1000);

    await new Promise<void>((r) => setTimeout(r, ms + 20));

    this.stopStream();

    const t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(1.0, t);
  }

  dispose(): void {
    this.interrupt();
    if (this.ctx && this.ctx.state !== "closed") {
      this.ctx.close().catch(() => {});
    }
    this.ctx = null;
    this.gain = null;
    this.streamNode = null;
    this.streamEl = null;
    this.unlocked = false;
    this._isPlaying = false;
  }

  isPlaying(): boolean {
    return this._isPlaying;
  }
}

function useProvideConversationAudio(): ConversationAudioContextType {
  const settings = useSettings();
  const auth = useAuth();

  const playerRef = useRef<AudioQueuePlayer | null>(null);
  if (!playerRef.current) {
    playerRef.current = new AudioQueuePlayer();
  }

  const getAudioUrl = useCallback(
    async (text: string, instructions: string, voice: AiVoice) => {
      const languageCode = settings.languageCode;
      if (!languageCode) {
        throw new Error(
          "Language is not set | useProvideConversationAudio.getAudioUrl",
        );
      }

      const response = await sendTextToAudioRequest(
        {
          languageCode: languageCode || "en",
          input: text.trim(),
          instructions,
          voice,
        },
        await auth.getToken(),
      );

      const audioUrl = response.audioUrl;
      if (!audioUrl) throw new Error("Failed to generate audio");
      return audioUrl;
    },
    [settings.languageCode, auth],
  );

  const startConversationAudio = useCallback(async () => {
    // MUST be called from a user gesture handler (button click/tap)
    await playerRef.current!.unlockFromGesture();
  }, []);

  const isUnlocked = useCallback(() => {
    return playerRef.current!.isUnlocked();
  }, []);

  const speak = useCallback(async (text: string, opts: SpeakOptions) => {
    const maxLength = 600;
    text = text.trim();
    const trimmedText =
      text.length > maxLength ? text.slice(0, maxLength) : text;
    const q = new URLSearchParams({
      input: trimmedText,
      voice: opts.voice,
      instructions: opts.instructions ?? "",
    });

    await playerRef.current!.playStreamUrl(`/api/ttsStream?${q}`);
  }, []);

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

  const dispose = useCallback(() => {
    playerRef.current!.dispose();
  }, []);

  const isPlayingChecker = useCallback(() => {
    return playerRef.current!.isPlaying();
  }, []);

  const [isPlaying, setIsPlaying] = React.useState(false);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const playing = isPlayingChecker();
      setIsPlaying(playing);
    }, 40);

    return () => {
      clearInterval(interval);
    };
  }, [isPlayingChecker]);

  return useMemo(
    () => ({
      startConversationAudio,
      isUnlocked,
      speak,
      interrupt,
      interruptWithFade,
      setVolume,
      getVolume,
      dispose,
      isPlaying,
    }),
    [
      startConversationAudio,
      isUnlocked,
      speak,
      interrupt,
      interruptWithFade,
      setVolume,
      getVolume,
      dispose,
      isPlaying,
    ],
  );
}

export function ConversationAudioProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const hook = useProvideConversationAudio();
  return (
    <ConversationAudioContext.Provider value={hook}>
      {children}
    </ConversationAudioContext.Provider>
  );
}

export const useConversationAudio = (): ConversationAudioContextType => {
  const context = useContext(ConversationAudioContext);
  if (!context) {
    throw new Error(
      "useConversationAudio must be used within a ConversationAudioProvider",
    );
  }
  return context;
};
