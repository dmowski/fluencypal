import { useCallback, useState } from "react";
import type { SessionMode, VoiceId } from "./types.js";

export const useSessionConfig = () => {
  const [systemInstruction, setSystemInstruction] = useState(
    "You are an English teacher. Reply briefly in one or two sentences.",
  );
  const [mode, setMode] = useState<SessionMode>("RealTimeConversation");
  const [voice, setVoice] = useState<VoiceId>("shimmer");
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);

  const isRealtimeMode = mode === "RealTimeConversation";

  const readSessionConfig = useCallback(
    () => ({
      languageCode: "en" as const,
      mode,
      voiceEnabled,
      micEnabled,
      systemInstruction: systemInstruction.trim(),
      voice,
    }),
    [mode, voiceEnabled, micEnabled, systemInstruction, voice],
  );

  return {
    systemInstruction,
    setSystemInstruction,
    mode,
    setMode,
    voice,
    setVoice,
    voiceEnabled,
    setVoiceEnabled,
    micEnabled,
    setMicEnabled,
    isRealtimeMode,
    readSessionConfig,
  };
};
