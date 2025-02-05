import { MAIN_CONVERSATION_MODEL, RealTimeModel } from "@/data/ai";
import { AiTool, ChatMessage, initAiRpc } from "@/libs/rtc";
import { useEffect, useState } from "react";

export type ConversationMode = "talk" | "analyze";

export const useAiConversation = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [currentMode, setCurrentMode] = useState<ConversationMode>();
  const [areasToImprove, setAreasToImprove] = useState<string[]>([]);
  const [conversation, setConversation] = useState<ChatMessage[]>([]);

  const [destroyRpc, setDestroyRpc] = useState<() => void>();
  useEffect(() => {
    return () => {
      destroyRpc?.();
    };
  }, []);

  const modes: Record<
    ConversationMode,
    { instruction: string; model: RealTimeModel; aiTools: AiTool[] }
  > = {
    analyze: {
      instruction: [
        "You are an English teacher.",
        "Ask the student to describe their day and take notes on areas that need improvement in grammar and vocabulary.",
        "Focus on identifying mistakes, but do not correct them directly.",
        "Do not explicitly teach or explain rules—just take notes while listening.",
        "Engage in a natural conversation without making it feel like a lesson.",
        "Start the conversation with: 'Hello, how was your day?'",
        "You should always call a function if you can.",
      ].join("\n"),
      model: MAIN_CONVERSATION_MODEL,
      aiTools: [
        {
          type: "function",
          name: "noteAreasToImprove",
          description:
            "Identify and note areas where the student needs improvement in grammar and vocabulary.",
          parameters: {
            type: "object",
            properties: {
              note: {
                type: "string",
                description:
                  "Specific grammar or vocabulary issue observed during the conversation.",
              },
            },
            required: ["note"],
          },
          handler: (args) => {
            const note = args.note;
            if (note) {
              setAreasToImprove((prev) => [...prev, note]);
            }
          },
        },
      ],
    },

    talk: {
      instruction: [
        `Your are English teacher.`,
        `Say hello to your student, ask them how they doing and start a lesson based on anser`,
      ].join("\n"),
      model: MAIN_CONVERSATION_MODEL,
      aiTools: [],
    },
  };

  const [eventTrigger, setEventTrigger] = useState<() => void>();

  const analyzeMe = () => {
    if (eventTrigger) {
      eventTrigger();
      console.log("Analyzing...");
    }
  };

  const startConversation = async (mode: ConversationMode) => {
    setCurrentMode(mode);
    setIsInitializing(true);
    const modeConfig = modes[mode];

    const initResults = await initAiRpc({
      model: modeConfig.model,
      initInstruction: modeConfig.instruction,
      aiTools: modeConfig.aiTools,
      onOpen: () => {
        console.log("Data Channel opened");
        setIsInitializing(false);
        setIsStarted(true);
      },
      onMessage: (message) => {
        setConversation((prev) => [...prev, message]);
      },
    });
    setDestroyRpc(() => initResults.closeHandler);
    setEventTrigger(() => initResults.eventTrigger);
  };

  const stopConversation = () => {
    destroyRpc?.();
    setIsStarted(false);
    setIsInitializing(false);
  };

  return {
    isInitializing,
    analyzeMe,
    currentMode,
    isStarted,
    startConversation,
    stopConversation,
    areasToImprove,
    conversation,
  };
};
