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
import { AiVoice, MODELS } from "@/common/ai";
import { AiRtcConfig, AiRtcInstance, AiTool, initAiRtc } from "./rtc";
import { useLocalStorage } from "react-use";
import { useChatHistory } from "../ConversationHistory/useChatHistory";
import { useUsage } from "../Usage/useUsage";
import { useSettings } from "../Settings/useSettings";
import { useHomework } from "../Homework/useHomework";
import { Homework } from "@/common/homework";
import { UsageLog } from "@/common/usage";
import { ChatMessage, ConversationMode } from "@/common/conversation";
import { useTasks } from "../Tasks/useTasks";
import { useWords } from "../Words/useWords";
import { sleep } from "@/libs/sleep";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { firstAiMessage } from "./data";
import { RolePlayInputResult, RolePlayInstruction } from "../RolePlay/types";

interface StartConversationProps {
  mode: ConversationMode;
  homework?: Homework;
  wordsToLearn?: string[];
  ruleToLearn?: string;
  voice?: AiVoice;
  customInstruction?: string;
}

interface AiConversationContextType {
  isSavingHomework: boolean;
  isInitializing: boolean;
  isStarted: boolean;
  startConversation: (params: StartConversationProps) => Promise<void>;
  doneConversation: () => Promise<void>;
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
  currentMode: ConversationMode;
}

const AiConversationContext = createContext<AiConversationContextType | null>(null);

const modesWithHomework: ConversationMode[] = ["talk", "talkAndCorrect", "beginner"];
const modesToExtractUserInfo: ConversationMode[] = ["talk", "talkAndCorrect", "beginner"];

function useProvideAiConversation(): AiConversationContextType {
  const [isInitializing, setIsInitializing] = useState(false);
  const history = useChatHistory();
  const settings = useSettings();
  const aiUserInfo = useAiUserInfo();
  const [activeHomework, setActiveHomework] = useState<Homework | null>(null);
  const userInfo = aiUserInfo.userInfo?.records?.join(". ") || "";
  const fullLanguageName = settings.fullLanguageName || "English";
  const languageCode = settings.languageCode || "en";

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

    if (conversation.length === 2) {
      if (currentMode === "words") {
        tasks.completeTask("words");
      } else if (currentMode === "rule") {
        tasks.completeTask("rule");
      } else {
        tasks.completeTask("lesson");
      }
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
    const newInstructionForHomework = `Generate summary of the lesson. Show user's mistakes.
Use ${fullLanguageName} language during providing feedback.
Create a text user have to repeat on the next lesson. It will be a homework.
Format homework following this structure:
Your homework is to repeat the following text:
"[Text to repeat]"
`;
    const generalSummary = `Generate summary of the lesson. Show user's mistakes and make general comments.`;
    const isNeedHomework = modesWithHomework.includes(currentMode);
    const newInstruction = isNeedHomework ? newInstructionForHomework : generalSummary;

    await calculateWordsUsageFromConversation();

    const isNeedToSaveUserInfo = modesToExtractUserInfo.includes(currentMode);
    if (isNeedToSaveUserInfo) {
      await aiUserInfo.updateUserInfo(conversation);
    }
    await communicatorRef.current?.updateSessionTrigger(newInstruction);
    await sleep(700);

    const endUserMessageHomework =
      "I am done for today. Create a text I have to repeat on the next lesson. Don't add anything else. Just give me homework";
    const endUserMessageJustAnalyze =
      "I am done for today. Show me my mistakes and make general comments. Don't add anything else. Just give me feedback";
    const endUserMessage = isNeedHomework ? endUserMessageHomework : endUserMessageJustAnalyze;
    communicatorRef.current?.addUserChatMessage(endUserMessage);
    await sleep(500);
    await communicatorRef.current?.triggerAiResponse();
    await sleep(1000);
    setIsClosing(false);
    setIsClosed(true);
  };

  const baseAiTools: AiTool[] = useMemo(() => {
    return [];
  }, [fullLanguageName]);

  const onOpen = async () => {
    await sleep(300);
    communicatorRef.current?.triggerAiResponse();
    await sleep(1800);
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
      languageCode: settings.languageCode || "en",
    };

    const openerInfoPrompt = userInfo
      ? `Student info: ${userInfo}. 

Ask the student to describe their day and try to cover new topics that used didn't mentioned before.
Don't focus solely on one topic. Try to cover a variety of topics.
`
      : "Ask the student to describe their day.";

    const firstMessage = userInfo
      ? `"${firstAiMessage[languageCode]}". You can mention student name if applicable. No need to introduce yourself, user already knows you.`
      : `"${firstAiMessage[languageCode]}"`;

    const firstCorrectionMessage = userInfo
      ? `"${firstAiMessage[languageCode]}". You can mention student name if applicable. No need to introduce yourself, user already knows you. Not needed provide correction for the first message`
      : `"${firstAiMessage[languageCode]}"`;

    const config: Record<ConversationMode, AiRtcConfig> = {
      talk: {
        ...baseConfig,
        model: MODELS.SMALL_CONVERSATION,
        initInstruction: `You are an ${fullLanguageName} teacher. Your name is "Bruno". Your role is to make user talks.
${openerInfoPrompt}
Do not teach or explain rules—just talk.
You should be friendly and engaging.
Don't make user feel like they are being tested and feel stupid.
If you feel that the user is struggling, you can propose a new topic.
Engage in a natural conversation without making it feel like a lesson.
Start the conversation with: ${firstMessage}. Say it in a friendly and calm way, no other words needed for the first hi.
${userInfo ? "" : "After the first user response, introduce yourself, your role of english teacher and ask user to describe their day."}
Speak slowly and clearly. Use ${fullLanguageName} language. Try to speak on user's level.

Use ${fullLanguageName} language during conversation.
`,
      },
      talkAndCorrect: {
        ...baseConfig,
        model: MODELS.SMALL_CONVERSATION,
        initInstruction: `You are an ${fullLanguageName} teacher.
Your name is "Bruno". The user wants both a conversation and corrections.
For every user message, you must reply with three parts in one response:
1) Response: React naturally to the user's message. You can comment, show interest, or share a short thought. Keep it friendly and supportive.

2) Your corrected version: Start with the phrase "Your corrected version:"
 - If the user made mistakes, tell them where a mistake was made and provide the corrected version.
 - If the user's message was perfect, do not correct anything. Instead, write "Your message is perfect."

3) Question: Ask a follow-up question that moves the conversation forward.

Speak in a clear, friendly tone. 
Use only ${fullLanguageName} language.
Avoid over-explaining grammar rules. Keep it interactive and supportive—never condescending or patronizing.

Start the conversation with simple phrase: ${firstCorrectionMessage}.
${userInfo ? `Info about student: ${userInfo}` : ""}
`,
      },
      beginner: {
        ...baseConfig,
        model: MODELS.SMALL_CONVERSATION,
        initInstruction: `You are an ${fullLanguageName} teacher. Your name is "Bruno". The user is a beginner who needs simple, clear communication.

For every user message, reply with **three parts** in a single response:

1) **Response**: 
   - Greet or acknowledge the user's statement in a friendly, supportive way. 
   - Use short, simple sentences and basic vocabulary.

2) **Question**: 
   - Ask a gentle, open-ended question related to the user's statement. 
   - Keep it simple and avoid complex grammar or advanced vocabulary.

3) **Example of Answer**: 
   - Provide a short, sample answer that the user might give. 
   - This helps them see how they could respond in ${fullLanguageName}. 
   - Keep it very simple. For instance, "I went to the store."

Remember:
- Speak slowly and clearly, using only ${fullLanguageName}.
- Use short sentences and simple words.
- Avoid detailed grammar explanations. 
- Do not overwhelm the user.
- Keep the conversation upbeat and encouraging.

${userInfo ? `Student info: ${userInfo}` : ""}

Start the conversation with: "${firstAiMessage[languageCode]}" (in a friendly and calm way, no other words needed for the initial greeting).


`,
      },
      words: {
        ...baseConfig,
        model: MODELS.SMALL_CONVERSATION,
        initInstruction: `You are an ${fullLanguageName} teacher.
Your name is "Bruno".
The user wants to learn new words.
Start your lesson be introducing new words with short explanation.
Then, ask user to use these words in sentences.
Go step by step, word by word.

${userInfo ? `Student info: ${userInfo}` : ""}
`,
      },

      rule: {
        ...baseConfig,
        model: MODELS.SMALL_CONVERSATION,
        initInstruction: `You are an ${fullLanguageName} teacher.
Your name is "Bruno".
The user wants to learn a new rule.
Start your lesson be introducing the rule with short explanation.
Then, ask user to use these rules in sentences.
Craft a lesson that will help user to understand the rule.

${userInfo ? `Student info: ${userInfo}` : ""}
`,
      },
      custom: {
        ...baseConfig,
        model: MODELS.SMALL_CONVERSATION,
        initInstruction: ``,
      },
    };
    return config;
  }, [fullLanguageName, userInfo]);

  const [currentMode, setCurrentMode] = useState<ConversationMode>("talk");

  const startConversation = async ({
    mode,
    homework,
    wordsToLearn,
    ruleToLearn,
    customInstruction,
    voice,
  }: StartConversationProps) => {
    if (!settings.languageCode) {
      throw new Error("Language is not set | startConversation");
    }
    try {
      setConversation([]);
      setIsClosing(false);
      setIsClosed(false);
      setErrorInitiating("");
      setIsInitializing(true);
      setCurrentMode(mode);
      const aiRtcConfig = aiRtcConfigs[mode];
      let instruction = aiRtcConfig.initInstruction;
      setActiveHomework(homework || null);
      if (homework) {
        await homeworkService.doneHomework(homework.id);
        instruction += `------
This is previous homework:
${homework.homework}

Start your speech with saying hello and remind user about his homework. Repeat homework text to refresh user's memory.
Do not needed to introduce yourself again. Just start with hello and homework reminder. Ask user to repeat homework text.
`;
      }

      if (wordsToLearn) {
        instruction += `------
Words to learn:
${wordsToLearn.join(" ")}
`;
      }

      if (ruleToLearn) {
        instruction += `------
Rule to learn:
${ruleToLearn}
`;
      }

      if (customInstruction) {
        instruction = customInstruction;
      }
      console.log("instruction:");
      console.log(instruction);
      const conversation = await initAiRtc({ ...aiRtcConfig, initInstruction: instruction, voice });
      history.createConversation({ conversationId, languageCode: settings.languageCode, mode });
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

  const doneConversation = async () => {
    setIsSavingHomework(true);
    const isNeedToSaveHomework = modesWithHomework.includes(currentMode);
    if (isNeedToSaveHomework && !activeHomework) {
      await saveHomework();
    }
    communicator?.closeHandler();
    setIsStarted(false);
    setIsInitializing(false);
    setConversationId(`${Date.now()}`);
    setIsSavingHomework(false);
    setConversation([]);
  };

  const addUserMessage = async (message: string) => {
    communicator?.addUserChatMessage(message);
    await sleep(100);
    await communicatorRef.current?.triggerAiResponse();
    const userMessage: ChatMessage = { isBot: false, text: message, id: `${Date.now()}` };

    setConversation((prev) => [...prev, userMessage]);
  };

  return {
    currentMode,
    isSavingHomework,
    isInitializing,
    isStarted,
    startConversation,
    doneConversation,
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
