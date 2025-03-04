"use client";
import { createContext, useContext, ReactNode, JSX } from "react";
import { useSettings } from "../Settings/useSettings";
import { generateAudioUrl } from "./generateAudioUrl";
import { useUsage } from "../Usage/useUsage";
import { AudioUsageLog } from "@/common/usage";

const fnv1aHash = (input: string) => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return (hash >>> 0).toString(16);
};
const cacheKey = `DL_audio-cache`;
interface AudioContextType {
  getAudioUrl: (text: string) => Promise<string>;
}

const AudioContext = createContext<AudioContextType | null>(null);

function useProvideAudio(): AudioContextType {
  const settings = useSettings();
  const usage = useUsage();

  const getUrlFromCache = async (text: string) => {
    const audioKey = fnv1aHash(text);

    const cachedStore = (localStorage.getItem(cacheKey) || "{}") as string;
    const cachedData = JSON.parse(cachedStore) as Record<string, string>;

    if (cachedData[audioKey]) {
      return cachedData[audioKey];
    }
    return null;
  };

  const setUrlToCache = async (text: string, url: string) => {
    const audioKey = fnv1aHash(text);
    const cachedStore = (localStorage.getItem(cacheKey) || "{}") as string;
    const cachedData = JSON.parse(cachedStore) as Record<string, string>;
    cachedData[audioKey] = url;
    localStorage.setItem(cacheKey, JSON.stringify(cachedData));
  };

  const getAudioUrl = async (text: string) => {
    const languageCode = settings.languageCode;
    if (!languageCode) {
      throw new Error("Language is not set | useProvideAudio.generate");
    }

    const urlFromCache = await getUrlFromCache(text);
    if (urlFromCache) {
      return urlFromCache;
    }

    const response = await generateAudioUrl({ text });

    const textUsageLog: AudioUsageLog = {
      usageId: `${Date.now()}`,
      languageCode,
      createdAt: Date.now(),
      price: response.price,
      type: "audio",
      size: response.text.length,
      duration: response.duration,
    };

    usage.setUsageLogs((logs) => [...logs, textUsageLog]);
    const audioUrl = response.url;
    if (!audioUrl) {
      throw new Error("Failed to generate audio");
    }
    await setUrlToCache(text, audioUrl);
    return audioUrl;
  };

  return {
    getAudioUrl,
  };
}

export function AudioProvider({ children }: { children: ReactNode }): JSX.Element {
  const hook = useProvideAudio();
  return <AudioContext.Provider value={hook}>{children}</AudioContext.Provider>;
}

export const useAudio = (): AudioContextType => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within a UsageProvider");
  }
  return context;
};
