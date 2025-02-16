"use client";

import { ChatMessage } from "@/features/Conversation/types";
import { MODELS } from "@/common/ai";
import { useEffect, useMemo, useRef, useState } from "react";
import { sleep } from "openai/core.mjs";
import { AiRtcConfig, AiRtcInstance, initAiRtc } from "./rtc";
import { useLocalStorage } from "react-use";
import { useChatHistory } from "./useChatHistory";
import { useUsage } from "../Usage/useUsage";
import { useSettings } from "../Settings/useSettings";
import { fullEnglishLanguageName } from "@/common/lang";

export type ConversationMode = "talk";

export const useAiConversation = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const history = useChatHistory();
  const settings = useSettings();
  const language = settings.language ? fullEnglishLanguageName[settings.language] : "English";
  const usage = useUsage();
  const [isStarted, setIsStarted] = useState(false);
  const [conversationId, setConversationId] = useState<string>(`${Date.now()}`);

  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [errorInitiating, setErrorInitiating] = useState<string>();
  const [isClosing, setIsClosing] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);

  const [communicator, setCommunicator] = useState<AiRtcInstance>();
  const communicatorRef = useRef(communicator);
  communicatorRef.current = communicator;

  const [isMuted, setIsMuted] = useLocalStorage<boolean>("isMuted", false);
  const [isShowUserInput, setIsShowUserInput] = useLocalStorage<boolean>("isShowUserInput", false);

  useEffect(() => {
    if (!conversationId || conversation.length === 0) return;
    history.setMessages(conversationId, conversation);
  }, [conversation.length]);

  const onAddDelta = (id: string, delta: string, isBot: boolean) => {
    setConversation((prev) => {
      let isNew = true;

      const newMessage = prev.map((message) => {
        if (message.id === id) {
          const oldText = message.text;
          isNew = false;
          return { ...message, text: oldText + delta };
        }
        return message;
      });

      if (isNew) {
        newMessage.push({ id, text: delta, isBot });
      }

      return newMessage;
    });
  };

  const toggleMute = (isMute: boolean) => {
    communicator?.toggleMute(isMute);
    setIsMuted(isMute);
  };

  useEffect(() => {
    return () => {
      communicator?.closeHandler();
    };
  }, []);

  const aiRtcConfig: AiRtcConfig = useMemo(() => {
    const config: AiRtcConfig = {
      model: MODELS.REALTIME_CONVERSATION,
      initInstruction: `You are an ${language} teacher. Your name is "Bruno". Your role is to make user talks.
Ask the student to describe their day.
Do not teach or explain rules—just talk.
You should be friendly and engaging.
Don't make user feel like they are being tested and feel stupid.
If you feel that the user is struggling, you can propose a new topic.
Engage in a natural conversation without making it feel like a lesson.
Start the conversation with: "Hello... I am here!". Say it in a friendly and calm way, no other words needed for the first hi.
After the first user response, introduce yourself, your role of english teacher and ask user to describe their day.
Speak slowly and clearly. Use ${language} language. Try to speed on user's level.
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
      onMessage: (message) =>
        setConversation((prev) => {
          const isExisting = prev.find((m) => m.id === message.id);
          if (isExisting) {
            return prev.map((m) => (m.id === message.id ? message : m));
          }
          return [...prev, message];
        }),
      onAddDelta,
      setIsAiSpeaking,
      setIsUserSpeaking,
      isMuted: isMuted || false,
      onAddUsage: (usageLog) => usage.setUsageLogs((prev) => [...prev, usageLog]),
    };
    return config;
  }, [language]);

  const startConversation = async () => {
    try {
      setIsClosing(false);
      setIsClosed(false);
      setErrorInitiating("");
      setIsInitializing(true);
      const conversation = await initAiRtc(aiRtcConfig);
      history.createConversation(conversationId, settings.language || "en");
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
    setConversationId(`${Date.now()}`);
  };

  const addUserMessage = async (message: string) => {
    communicator?.addUserChatMessage(message);
    await sleep(100);
    await communicatorRef.current?.triggerAiResponse();
    const userMessage: ChatMessage = { isBot: false, text: message, id: `${Date.now()}` };

    setConversation((prev) => [...prev, userMessage]);
  };

  return {
    isInitializing,
    isStarted,
    startConversation,
    stopConversation,
    conversation,
    errorInitiating,
    isClosing,
    isAiSpeaking,
    isClosed,
    isUserSpeaking,
    toggleMute,
    isMuted,
    addUserMessage,
    isShowUserInput,
    setIsShowUserInput,
  };
};
