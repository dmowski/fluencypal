"use client";
import { createContext, useContext, ReactNode, JSX } from "react";
import { useSettings } from "../Settings/useSettings";
import { useAuth } from "../Auth/useAuth";
import { sendTextToAudioRequest } from "@/app/api/textToAudio/sendTextToAudioRequest";
import { AiVoice } from "@/common/ai";

interface AudioContextType {
  getAudioUrl: (text: string, instructions: string, voice: AiVoice) => Promise<string>;
}

const AudioContext = createContext<AudioContextType | null>(null);

function useProvideAudio(): AudioContextType {
  const settings = useSettings();
  const auth = useAuth();

  const getAudioUrl = async (text: string, instructions: string, voice: AiVoice) => {
    const languageCode = settings.languageCode;
    if (!languageCode) {
      throw new Error("Language is not set | useProvideAudio.getAudioUrl");
    }

    const response = await sendTextToAudioRequest(
      {
        languageCode: settings.languageCode || "en",
        input: text.trim(),
        instructions,
        voice,
      },
      await auth.getToken()
    );
    const audioUrl = response.audioUrl;
    if (!audioUrl) {
      throw new Error("Failed to generate audio");
    }
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
