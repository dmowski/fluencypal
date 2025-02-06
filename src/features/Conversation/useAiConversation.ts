"use client";
import { ChatMessage } from "@/features/Conversation/types";
import { MODELS, RealTimeModel } from "@/common/ai";
import { useEffect, useState } from "react";
import { AiTool, initAiRpc } from "./rtc";
import { reviewConversation } from "./reviewConversation";

export type ConversationMode = "talk" | "analyze";

type InitRtcResponse = Awaited<ReturnType<typeof initAiRpc>>;

export const useAiConversation = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [currentMode, setCurrentMode] = useState<ConversationMode>();
  const [areasToImprove, setAreasToImprove] = useState<string>("");
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [errorInitiating, setErrorInitiating] = useState<string>();

  const [communicator, setCommunicator] = useState<InitRtcResponse>();
  useEffect(() => {
    return () => {
      communicator?.closeHandler();
    };
  }, []);

  const modes: Record<
    ConversationMode,
    { instruction: string; model: RealTimeModel; aiTools: AiTool[] }
  > = {
    analyze: {
      instruction: [
        "You are an English teacher. Your role is to make user talks.",
        "Ask the student to describe their day.",
        "Do not teach or explain rules—just talk.",
        "You should be friendly and engaging.",
        "Don't make user feel like they are being tested and feel stupid.",
        "If you feel that the user is struggling, you can propose a new topic.",
        "Engage in a natural conversation without making it feel like a lesson.",
        "Start the conversation with: 'Hello, how was your day?'",
      ].join("\n"),
      model: MODELS.REALTIME_CONVERSATION,
      aiTools: [],
    },

    talk: {
      instruction: [
        `Your are English teacher.`,
        `Say hello to your student, ask them how they doing and start a lesson based on anser`,
      ].join("\n"),
      model: MODELS.REALTIME_CONVERSATION,
      aiTools: [],
    },
  };

  const reviewChat = async () => {
    setAreasToImprove("Loading");
    const result = await reviewConversation(conversation);
    setAreasToImprove(result);
  };

  const analyzeMe = async () => {
    const instruction =
      "Switch to Teacher mode, ask user to rephrase his statement correctly. Give examples and explain the rules.";
    setAreasToImprove("Updated instruction: " + instruction);
    await communicator?.updateSessionTrigger(instruction);
  };

  const startConversation = async (mode: ConversationMode) => {
    setErrorInitiating("");
    console.log("startConversation", mode);
    setCurrentMode(mode);
    setIsInitializing(true);
    const modeConfig = modes[mode];

    try {
      const conversation = await initAiRpc({
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
      setCommunicator(conversation);
    } catch (e) {
      console.log(e);
      setErrorInitiating("Something went wrong. Try again later");
      setIsInitializing(false);
    }
  };

  const stopConversation = () => {
    communicator?.closeHandler();
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
    errorInitiating,
  };
};
