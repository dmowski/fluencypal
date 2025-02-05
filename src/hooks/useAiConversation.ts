import { MAIN_CONVERSATION_MODEL, RealTimeModel } from "@/data/ai";
import { initAiRpc } from "@/libs/rtc";
import { useEffect, useState } from "react";

export type ConversationMode = "talk" | "analyze";

const modes: Record<ConversationMode, { instruction: string; model: RealTimeModel }> = {
  talk: {
    instruction: [
      `Your are English teacher.`,
      `Say hello to your student, ask them how they doing and start a lesson based on anser`,
    ].join("\n"),
    model: MAIN_CONVERSATION_MODEL,
  },
  analyze: {
    instruction: [
      `Your are English teacher.`,
      `Ask your student to describe their day and analyze their response from grammar and vocabulary perspective`,
    ].join("\n"),
    model: MAIN_CONVERSATION_MODEL,
  },
};

export const useAiConversation = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [currentMode, setCurrentMode] = useState<ConversationMode>();

  const [destroyRpc, setDestroyRpc] = useState<() => void>();
  useEffect(() => {
    return () => {
      destroyRpc?.();
    };
  }, []);

  const startConversation = async (mode: ConversationMode) => {
    setCurrentMode(mode);
    const modeConfig = modes[mode];
    const model = modeConfig.model;
    const instruction = modeConfig.instruction;

    setIsInitializing(true);
    const initResults = await initAiRpc({
      model: model,
      initInstruction: instruction,
      onMessage: (e) => {
        console.log("Data Channel message:", e);
      },
      onOpen: () => {
        console.log("Data Channel opened");
        setIsInitializing(false);
        setIsStarted(true);
      },
    });
    setDestroyRpc(() => initResults.closeHandler);
  };

  const stopConversation = () => {
    destroyRpc?.();
    setIsStarted(false);
    setIsInitializing(false);
  };

  return {
    isInitializing,
    currentMode,
    isStarted,
    startConversation,
    stopConversation,
  };
};
