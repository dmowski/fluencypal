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
import { TextToAudioVoice } from "@/app/api/textToAudio/types";

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
  voice: TextToAudioVoice;
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

const ConversationAudioContext = createContext<ConversationAudioContextType | null>(null);

class AudioQueuePlayer {
  private ctx: AudioContext | null = null;
  private gain: GainNode | null = null;

  private nextTime = 0;
  private sources = new Set<AudioBufferSourceNode>();
  private unlocked = false;

  isPlaying(): boolean {
    if (!this.ctx) return false;
    if (this.ctx.state === "closed") return false;

    // Actively playing sources
    if (this.sources.size > 0) return true;

    // Scheduled queue (nothing currently playing but queued)
    const now = this.ctx.currentTime;
    return this.nextTime > now + 0.03; // epsilon to avoid flicker
  }

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

    // "Warm up" schedule time to avoid underruns
    this.nextTime = Math.max(this.ctx.currentTime + 0.05, this.nextTime);
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

  async enqueueArrayBuffer(arrayBuffer: ArrayBuffer): Promise<void> {
    if (!this.ctx || !this.gain) {
      throw new Error("AudioQueuePlayer: not unlocked. Call unlockFromGesture() first.");
    }

    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    // decodeAudioData may detach the buffer in some browsers; slice to be safe
    const decoded = await this.ctx.decodeAudioData(arrayBuffer.slice(0));

    const src = this.ctx.createBufferSource();
    src.buffer = decoded;
    src.connect(this.gain);

    const startAt = Math.max(this.nextTime, this.ctx.currentTime + 0.02);
    src.start(startAt);

    this.sources.add(src);

    const waitUnitFinish = new Promise<void>((r) => {
      src.onended = () => {
        this.sources.delete(src);
        r();
      };
    });

    this.nextTime = startAt + decoded.duration;
    await waitUnitFinish;
  }

  interrupt(): void {
    if (!this.ctx) return;

    for (const s of this.sources) {
      try {
        s.stop();
      } catch {}
    }
    this.sources.clear();
    this.nextTime = this.ctx.currentTime + 0.02;
  }

  async interruptWithFade(ms = 120): Promise<void> {
    if (!this.ctx || !this.gain) {
      this.interrupt();
      return;
    }

    // If Safari suspended the context, resume it so automation works predictably
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const g = this.gain.gain;

    // Fade out
    g.cancelScheduledValues(now);
    g.setValueAtTime(g.value, now);
    g.linearRampToValueAtTime(0.0001, now + ms / 1000);

    // Wait until fade is effectively done
    await new Promise<void>((r) => setTimeout(() => r(), ms + 20));

    // Stop everything & clear schedule
    this.interrupt();

    // Immediately restore volume NOW (not later on a timer)
    const t = this.ctx.currentTime;
    g.cancelScheduledValues(t);
    g.setValueAtTime(1.0, t);
  }

  dispose(): void {
    this.interrupt();
    if (this.ctx && this.ctx.state !== "closed") {
      // close() may fail if called during certain states; ignore
      this.ctx.close().catch(() => {});
    }
    this.ctx = null;
    this.gain = null;
    this.unlocked = false;
    this.nextTime = 0;
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
    async (text: string, instructions: string, voice: TextToAudioVoice) => {
      const languageCode = settings.languageCode;
      if (!languageCode) {
        throw new Error("Language is not set | useProvideConversationAudio.getAudioUrl");
      }

      const response = await sendTextToAudioRequest(
        {
          languageCode: languageCode || "en",
          input: text.trim(),
          instructions,
          voice,
        },
        await auth.getToken()
      );

      const audioUrl = response.audioUrl;
      if (!audioUrl) throw new Error("Failed to generate audio");
      return audioUrl;
    },
    [settings.languageCode, auth]
  );

  const startConversationAudio = useCallback(async () => {
    // MUST be called from a user gesture handler (button click/tap)
    await playerRef.current!.unlockFromGesture();
  }, []);

  const isUnlocked = useCallback(() => {
    return playerRef.current!.isUnlocked();
  }, []);

  const speak = useCallback(
    async (text: string, opts: SpeakOptions) => {
      const maxLength = 400;
      text = text.trim();
      const trimmedText = text.length > maxLength ? text.slice(0, maxLength) : text;

      if (!playerRef.current!.isUnlocked()) {
        throw new Error(
          "Audio is not unlocked. Call startConversationAudio() from a user gesture first."
        );
      }
      const url =
        opts.audioUrl ?? (await getAudioUrl(trimmedText, opts.instructions ?? "", opts.voice));
      const proxied = `/api/audioProxy?url=${encodeURIComponent(url)}`;

      // fetch audio bytes
      const res = await fetch(proxied);
      if (!res.ok) throw new Error(`Failed to fetch audio: ${res.status}`);
      const ab = await res.arrayBuffer();

      // decode + enqueue
      await playerRef.current!.enqueueArrayBuffer(ab);
    },
    [getAudioUrl]
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
    ]
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
    throw new Error("useConversationAudio must be used within a ConversationAudioProvider");
  }
  return context;
};
