"use client";
import { ChatMessage } from "@/features/Conversation/types";
import { MODELS } from "@/common/ai";
import { useEffect, useMemo, useRef, useState } from "react";

import { sleep } from "openai/core.mjs";
import { AiRtcConfig, AiRtcInstance, initAiRtc } from "./rtc";

export type ConversationMode = "talk";

export const useAiConversation = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [areasToImprove, setAreasToImprove] = useState<string>("");
  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [errorInitiating, setErrorInitiating] = useState<string>();
  const [isClosing, setIsClosing] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  const [communicator, setCommunicator] = useState<AiRtcInstance>();
  const communicatorRef = useRef(communicator);
  communicatorRef.current = communicator;

  useEffect(() => {
    return () => {
      communicator?.closeHandler();
    };
  }, []);

  const aiRtcConfig: AiRtcConfig = useMemo(
    () => ({
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
          name: "finish_the_lesson",
          handler: async (args) => {
            setIsClosing(true);
            communicatorRef.current?.toggleMute(true);
            const newInstruction = `Generate summary of the lesson and give feedback.
Create a text user have to repeat on the next lesson.
It will be homework
`;
            await communicatorRef.current?.updateSessionTrigger(newInstruction);
            await sleep(1000);
            communicatorRef.current?.addUserChatMessage(
              "I am done for today. Generate me summary and give me homework."
            );
            await sleep(1000);
            await communicatorRef.current?.triggerAiResponse();
            await sleep(1000);
            setIsClosed(true);
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
    }),
    []
  );

  const analyzeMe = async () => {
    const instruction =
      "Switch to Teacher mode, ask user to rephrase his statement correctly. Give examples and explain the rules.";
    setAreasToImprove("Updated instruction: " + instruction);
    await communicator?.updateSessionTrigger(instruction);
  };

  const startConversation = async () => {
    try {
      setIsClosing(false);
      setIsClosed(false);
      setErrorInitiating("");
      setIsInitializing(true);
      const conversation = await initAiRtc(aiRtcConfig);
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
    isStarted,
    startConversation,
    stopConversation,
    areasToImprove,
    conversation,
    errorInitiating,
    isClosing,
    isClosed,
  };
};
