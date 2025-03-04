"use client";
import { createContext, useContext, ReactNode, JSX } from "react";
import { useSettings } from "../Settings/useSettings";
import { generateAudioUrl } from "./generateAudioUrl";
import { useUsage } from "../Usage/useUsage";
import { AudioUsageLog } from "@/common/usage";

interface AudioContextType {
  getAudioUrl: (text: string) => Promise<string>;
}

const AudioContext = createContext<AudioContextType | null>(null);

function useProvideAudio(): AudioContextType {
  const settings = useSettings();
  const usage = useUsage();

  const getAudioUrl = async (text: string) => {
    const languageCode = settings.languageCode;
    if (!languageCode) {
      throw new Error("Language is not set | useProvideAudio.generate");
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
    return response.url;
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
