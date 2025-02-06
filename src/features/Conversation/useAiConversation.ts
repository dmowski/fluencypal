"use client";
import { ChatMessage } from "@/features/Conversation/types";
import { MODELS, RealTimeModel } from "@/common/ai";
import { useEffect, useMemo, useState } from "react";
import { AiTool, initAiRpc } from "./rtc";
import { reviewConversation } from "./reviewConversation";

export type ConversationMode = "talk";

type InitRtcResponse = Awaited<ReturnType<typeof initAiRpc>>;
type InitRtcProps = Parameters<typeof initAiRpc>[0];

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

  const modes: Record<ConversationMode, InitRtcProps> = useMemo(
    () => ({
      talk: {
        model: MODELS.REALTIME_CONVERSATION,

        initInstruction: `You are an English teacher. Your role is to make user talks.
Ask the student to describe their day.
Do not teach or explain rules—just talk.
You should be friendly and engaging.
Don't make user feel like they are being tested and feel stupid.
If you feel that the user is struggling, you can propose a new topic.
Engage in a natural conversation without making it feel like a lesson.
Start the conversation with: 'Hello, how was your day?`,
        aiTools: [
          {
            name: "Finish the lesson",
            handler: (args) => {
              // todo: update prompt to focus on review conversation
              // Generate homework
              console.log("🔥 Finish the lesson", args);
            },
            type: "function",
            description: "When the user wants to finish the lesson, call this function.",
            parameters: {
              type: "object",
              properties: {},
              required: [],
            },
          },
        ],
        onOpen: () => {
          console.log("Data Channel opened");
          setIsInitializing(false);
          setIsStarted(true);
        },
        onMessage: (message) => {
          setConversation((prev) => [...prev, message]);
        },
      },
    }),
    []
  );

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

  const startConversation = async () => {
    try {
      setErrorInitiating("");
      const mode = "talk";
      setCurrentMode(mode);
      setIsInitializing(true);
      const conversation = await initAiRpc(modes[mode]);
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
