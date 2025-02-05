import { MAIN_CONVERSATION_MODEL } from "@/data/ai";
import { initAiRpc } from "@/libs/rtc";
import { useEffect, useState } from "react";

export const useAiConversation = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isStarted, setIsStarted] = useState(false);

  const [destroyRpc, setDestroyRpc] = useState<() => void>();
  useEffect(() => {
    return () => {
      destroyRpc?.();
    };
  }, []);

  const startConversation = async () => {
    setIsInitializing(true);
    const initResults = await initAiRpc({
      model: MAIN_CONVERSATION_MODEL,
      initInstruction: [
        `Your are English teacher.`,
        `Say hello to your student, ask them how they doing and start a lesson based on anser`,
      ].join("\n"),
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

  return {
    isInitializing,
    isStarted,
    startConversation,
  };
};
