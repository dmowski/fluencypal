import { useMemo } from "react";
import type { SessionMode } from "./types.js";

export const useConversationUi = (params: {
  signedIn: boolean;
  connected: boolean;
  callActive: boolean;
  micEnabled: boolean;
  isRealtimeMode: boolean;
}) => {
  const { signedIn, connected, callActive, micEnabled, isRealtimeMode } = params;

  const talkHint = useMemo(() => {
    if (!connected) {
      return signedIn
        ? "Click Connect to open a WebSocket session."
        : "Sign in to start a conversation.";
    }

    if (!micEnabled) {
      return 'Microphone is disabled in session settings. Enable "Mic On" to speak.';
    }

    if (isRealtimeMode) {
      return "Click “Start call”. Speak over the assistant to interrupt. Use headphones if the mic picks up speaker echo.";
    }

    return "Hold “Hold to talk” while speaking, then release to send. Or type a message below.";
  }, [connected, isRealtimeMode, micEnabled, signedIn]);

  const steps = useMemo(
    () => ({
      signInDone: signedIn,
      signInActive: !signedIn,
      connectDone: connected,
      connectActive: signedIn && !connected,
      talkDone: callActive,
      talkActive: connected && !callActive,
    }),
    [signedIn, connected, callActive],
  );

  return { talkHint, steps };
};

export type { SessionMode };
