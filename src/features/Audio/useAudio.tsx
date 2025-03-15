"use client";
import { createContext, useContext, ReactNode, JSX } from "react";
import { useSettings } from "../Settings/useSettings";
import { generateAudioUrl } from "./generateAudioUrl";
import { getDataFromCache, setDataToCache } from "@/libs/localStorageCache";
import { useAuth } from "../Auth/useAuth";

const audioCacheKey = `DL_audio-cache`;
interface AudioContextType {
  getAudioUrl: (text: string) => Promise<string>;
}

const AudioContext = createContext<AudioContextType | null>(null);

function useProvideAudio(): AudioContextType {
  const settings = useSettings();
  const auth = useAuth();

  const getAudioUrl = async (text: string) => {
    const languageCode = settings.languageCode;
    if (!languageCode) {
      throw new Error("Language is not set | useProvideAudio.getAudioUrl");
    }

    const urlFromCache = await getDataFromCache({ inputValue: text, storageSpace: audioCacheKey });
    if (urlFromCache) {
      return urlFromCache;
    }

    const response = await generateAudioUrl(
      { text, languageCode: settings.languageCode || "en" },
      await auth.getToken()
    );
    const audioUrl = response.url;
    if (!audioUrl) {
      throw new Error("Failed to generate audio");
    }
    await setDataToCache({ inputValue: text, outputValue: audioUrl, storageSpace: audioCacheKey });
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
