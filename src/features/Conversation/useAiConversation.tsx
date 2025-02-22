"use client";

import {
  createContext,
  useContext,
  ReactNode,
  JSX,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MODELS } from "@/common/ai";
import { AiRtcConfig, AiRtcInstance, AiTool, initAiRtc } from "./rtc";
import { useLocalStorage } from "react-use";
import { useChatHistory } from "./useChatHistory";
import { useUsage } from "../Usage/useUsage";
import { useSettings } from "../Settings/useSettings";
import { fullEnglishLanguageName } from "@/common/lang";
import { useHomework } from "./useHomework";
import { Homework } from "@/common/homework";
import { UsageLog } from "@/common/usage";
import { ChatMessage, ConversationMode } from "@/common/conversation";
import { useTasks } from "../Tasks/useTasks";
import { useWords } from "../Words/useWords";
import { sleep } from "@/libs/sleep";

interface AiConversationContextType {
  isSavingHomework: boolean;
  isInitializing: boolean;
  isStarted: boolean;
  startConversation: (params: { mode: ConversationMode; homework?: Homework }) => Promise<void>;
  stopConversation: () => Promise<void>;
  finishLesson: () => Promise<void>;
  conversation: ChatMessage[];
  errorInitiating?: string;
  isClosing: boolean;
  isAiSpeaking: boolean;
  isClosed: boolean;
  isUserSpeaking: boolean;
  toggleMute: (isMute: boolean) => void;
  isMuted: boolean;
  addUserMessage: (message: string) => Promise<void>;
  isShowUserInput: boolean;
  setIsShowUserInput: (value: boolean) => void;
}

const AiConversationContext = createContext<AiConversationContextType | null>(null);

function useProvideAiConversation(): AiConversationContextType {
  const [isInitializing, setIsInitializing] = useState(false);
  const history = useChatHistory();
  const settings = useSettings();
  const language = settings.language ? fullEnglishLanguageName[settings.language] : "English";
  const usage = useUsage();
  const [isStarted, setIsStarted] = useState(false);
  const homeworkService = useHomework();
  const [conversationId, setConversationId] = useState<string>(`${Date.now()}`);

  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [errorInitiating, setErrorInitiating] = useState<string>();
  const [isClosing, setIsClosing] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const words = useWords();
  const tasks = useTasks();

  const [communicator, setCommunicator] = useState<AiRtcInstance>();
  const communicatorRef = useRef(communicator);
  communicatorRef.current = communicator;

  const [isMuted, setIsMuted] = useLocalStorage<boolean>("isMuted", false);
  const [isShowUserInput, setIsShowUserInput] = useLocalStorage<boolean>("isShowUserInput", false);

  useEffect(() => {
    if (!conversationId || conversation.length === 0) return;
    history.setMessages(conversationId, conversation);

    if (conversation.length === 5) {
      tasks.completeTask("lesson");
    }
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

  const calculateWordsUsageFromConversation = async () => {
    const userMessages = conversation.filter((m) => !m.isBot);
    const userText = userMessages.map((m) => m.text).join(" ");
    await words.addWordsStatFromText(userText);
  };

  const finishLesson = async () => {
    setIsClosing(true);
    communicatorRef.current?.toggleMute(true);
    const newInstruction = `Generate summary of the lesson. Show user's mistakes.
Create a text user have to repeat on the next lesson. It will be a homework.
Format homework following this structure:
Your homework is to repeat the following text:
"[Text to repeat]"
`;
    await calculateWordsUsageFromConversation();
    await communicatorRef.current?.updateSessionTrigger(newInstruction);
    await sleep(700);
    communicatorRef.current?.addUserChatMessage(
      "I am done for today. Create a text I have to repeat on the next lesson. Don't add anything else. Just give me homework"
    );
    await sleep(500);
    await communicatorRef.current?.triggerAiResponse();
    setIsClosing(false);
    setIsClosed(true);
  };

  const baseAiTools: AiTool[] = useMemo(() => {
    return [];
  }, [language]);

  const onOpen = async () => {
    await sleep(1000);
    communicatorRef.current?.triggerAiResponse();
    setIsInitializing(false);
    setIsStarted(true);
  };

  const onMessage = (message: ChatMessage) => {
    setConversation((prev) => {
      const isExisting = prev.find((m) => m.id === message.id);
      if (isExisting) {
        return prev.map((m) => (m.id === message.id ? message : m));
      }
      return [...prev, message];
    });
  };

  const aiRtcConfigs: Record<ConversationMode, AiRtcConfig> = useMemo(() => {
    const baseConfig = {
      model: MODELS.SMALL_CONVERSATION,
      initInstruction: "",
      aiTools: baseAiTools,
      onOpen,
      onMessage,
      onAddDelta,
      setIsAiSpeaking,
      setIsUserSpeaking,
      isMuted: isMuted || false,
      onAddUsage: (usageLog: UsageLog) => usage.setUsageLogs((prev) => [...prev, usageLog]),
    };

    const config: Record<ConversationMode, AiRtcConfig> = {
      talk: {
        ...baseConfig,
        model: MODELS.SMALL_CONVERSATION,
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
      },
      "talk-and-correct": {
        model: MODELS.SMALL_CONVERSATION,
        initInstruction: `You are an ${language} teacher. Your name is "Bruno". The user wants both a conversation *and* corrections.
For every user message, you must reply with three parts **in one response**:

1) **Response**: React naturally to the user's message. You can comment, show interest, or share a short thought. Keep it friendly and supportive.

2) **Your corrected version**: 
   - Start with the phrase "Your corrected version:"
   - If the user made mistakes, show them using double underscores around the corrected parts (e.g., "I __am a__ doctor.").
   - If the user's message was perfect, write a short phrase like "(No mistakes!)."

3) **Question**:
   - Ask a follow-up question that moves the conversation forward.
   - Relate it to what the user said or the context, prompting them to elaborate or talk more.

Speak in a clear, friendly tone. Use only ${language}. Avoid over-explaining grammar rules. Keep it interactive and supportive—never condescending or patronizing.

Start the conversation with: "Hello... I am here!" (in ${language} lang) in a friendly and calm way, no other words needed for the initial greeting).
`,
        aiTools: baseAiTools,
        onOpen,
        onMessage,
        onAddDelta,
        setIsAiSpeaking,
        setIsUserSpeaking,
        isMuted: isMuted || false,
        onAddUsage: (usageLog) => usage.setUsageLogs((prev) => [...prev, usageLog]),
      },
      beginner: {
        model: MODELS.SMALL_CONVERSATION,
        initInstruction: `You are an ${language} teacher. Your name is "Bruno". The user is a beginner who needs simple, clear communication.

For every user message, reply with **three parts** in a single response:

1) **Response**: 
   - Greet or acknowledge the user's statement in a friendly, supportive way. 
   - Use short, simple sentences and basic vocabulary.

2) **Question**: 
   - Ask a gentle, open-ended question related to the user's statement. 
   - Keep it simple and avoid complex grammar or advanced vocabulary.

3) **Example of Answer**: 
   - Provide a short, sample answer that the user might give. 
   - This helps them see how they could respond in ${language}. 
   - Keep it very simple. For instance, "I went to the store."

Remember:
- Speak slowly and clearly, using only ${language}.
- Use short sentences and simple words.
- Avoid detailed grammar explanations. 
- Do not overwhelm the user.
- Keep the conversation upbeat and encouraging.

Start the conversation with: "Hello... I am here!" (in ${language} lang) (in a friendly and calm way, no other words needed for the initial greeting).
`,
        aiTools: baseAiTools,
        onOpen,
        onMessage,
        onAddDelta,
        setIsAiSpeaking,
        setIsUserSpeaking,
        isMuted: isMuted || false,
        onAddUsage: (usageLog) => usage.setUsageLogs((prev) => [...prev, usageLog]),
      },
    };
    return config;
  }, [language]);

  const [currentMode, setCurrentMode] = useState<ConversationMode>("talk");
  interface StartConversationProps {
    mode: ConversationMode;
    homework?: Homework;
  }
  const startConversation = async ({ mode, homework }: StartConversationProps) => {
    try {
      setIsClosing(false);
      setIsClosed(false);
      setErrorInitiating("");
      setIsInitializing(true);
      setCurrentMode(mode);
      const aiRtcConfig = aiRtcConfigs[mode];
      let instruction = aiRtcConfig.initInstruction;
      if (homework) {
        await homeworkService.doneHomework(homework.id);
        instruction += `------
This is previous homework:
${homework.homework}

Start your speech with saying hello and remind user about his homework. Repeat homework text to refresh user's memory.
Do not needed to introduce yourself again. Just start with hello and homework reminder. Ask user to repeat homework text.
`;
      }

      const conversation = await initAiRtc({ ...aiRtcConfig, initInstruction: instruction });
      history.createConversation({ conversationId, language: settings.language || "en", mode });
      setCommunicator(conversation);
    } catch (e) {
      console.log(e);
      setErrorInitiating("Something went wrong. Try again later");
      setIsInitializing(false);
    }
  };

  const [isSavingHomework, setIsSavingHomework] = useState(false);

  const saveHomework = async () => {
    const lastMessage = conversation[conversation.length - 1];
    if (!lastMessage?.isBot) {
      return;
    }
    const homeworkText = lastMessage.text;
    await homeworkService.saveHomework({
      id: `${Date.now()}`,
      mode: currentMode,
      conversationId: conversationId,
      createdAt: Date.now(),
      homework: homeworkText,
      isDone: false,
      isSkip: false,
    });
  };

  const stopConversation = async () => {
    setIsSavingHomework(true);
    await saveHomework();
    communicator?.closeHandler();
    setIsStarted(false);
    setIsInitializing(false);
    setConversationId(`${Date.now()}`);
    setIsSavingHomework(false);
  };

  const addUserMessage = async (message: string) => {
    communicator?.addUserChatMessage(message);
    await sleep(100);
    await communicatorRef.current?.triggerAiResponse();
    const userMessage: ChatMessage = { isBot: false, text: message, id: `${Date.now()}` };

    setConversation((prev) => [...prev, userMessage]);
  };

  return {
    isSavingHomework,
    isInitializing,
    isStarted,
    startConversation,
    stopConversation,
    finishLesson,
    conversation,
    errorInitiating,
    isClosing,
    isAiSpeaking,
    isClosed,
    isUserSpeaking,
    toggleMute,
    isMuted: isMuted || false,
    addUserMessage,
    isShowUserInput: isShowUserInput || false,
    setIsShowUserInput,
  };
}

export function AiConversationProvider({ children }: { children: ReactNode }): JSX.Element {
  const aiConversationData = useProvideAiConversation();
  return (
    <AiConversationContext.Provider value={aiConversationData}>
      {children}
    </AiConversationContext.Provider>
  );
}

export function useAiConversation(): AiConversationContextType {
  const context = useContext(AiConversationContext);
  if (!context) {
    throw new Error("useAiConversation must be used within an AiConversationProvider");
  }
  return context;
}
