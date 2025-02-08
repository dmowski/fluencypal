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

      initInstruction: `You are an English teacher. Your name is "Bruno". Your role is to make user talks.
Ask the student to describe their day.
Do not teach or explain rules—just talk.
You should be friendly and engaging.
Don't make user feel like they are being tested and feel stupid.
If you feel that the user is struggling, you can propose a new topic.
Engage in a natural conversation without making it feel like a lesson.
Start the conversation with: 'Hello, I am here.'.
After the first user response, introduce yourself, your role of english teacher and ask user to describe their day.
Speak slowly and clearly.
`,
      aiTools: [
        {
          name: "finish_the_lesson",
          handler: async (args) => {
            setIsClosing(true);
            communicatorRef.current?.toggleMute(true);
            const newInstruction = `Generate summary of the lesson. Show user's mistakes.
Create a text user have to repeat on the next lesson. It will be a homework.`;
            await communicatorRef.current?.updateSessionTrigger(newInstruction);
            await sleep(2000);
            communicatorRef.current?.addUserChatMessage(
              "I am done for today. Create a text I have to repeat on the next lesson."
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
            required: [] as string[],
          },
        },
      ],
      onOpen: () => {
        console.log("Data Channel opened");
        setTimeout(() => {
          communicatorRef.current?.triggerAiResponse();
          setIsInitializing(false);
          setIsStarted(true);
        }, 1000);
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
    if (2 > 0) {
      setIsInitializing(true);
      setTimeout(() => {
        setIsInitializing(false);
        setIsStarted(true);
      }, 3000);
      return;
    }
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
