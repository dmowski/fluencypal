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
import { UsageLog } from "@/common/usage";
import { ChatMessage, ConversationMode } from "@/common/conversation";
import { useTasks } from "../Tasks/useTasks";
import { sleep } from "@/libs/sleep";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { GuessGameStat } from "./types";
import { useAuth } from "../Auth/useAuth";
import { firstAiMessage, fullEnglishLanguageName, getUserLangCode } from "@/features/Lang/lang";
import { useRouter, useSearchParams } from "next/navigation";
import { GoalElementInfo, GoalPlan } from "../Plan/types";
import { usePlan } from "../Plan/usePlan";
import * as Sentry from "@sentry/nextjs";
import { isDev } from "../Analytics/isDev";
import { useGame } from "../Game/useGame";

const levelDescriptionsForAi: Record<string, string> = {
  A1: "User's language level is Beginner. Use extremely simple words and short sentences. Focus on basics.",
  A2: "User's language level is Elementary. Use clear, short sentences and common expressions. Avoid complexity.",
  B1: "User's language level is Intermediate. Use straightforward language with some variety. Explain unfamiliar terms.",
  B2: "User's language level is Upper intermediate. Can handle more complex structures and wider vocabulary.",
  C1: "User's language level is Advanced. Can understand complex topics and use specialized vocabulary.",
};

interface StartConversationProps {
  mode: ConversationMode;
  wordsToLearn?: string[];
  ruleToLearn?: string;
  voice?: AiVoice;
  customInstruction?: string;
  gameWords?: GuessGameStat;
  analyzeResultAiInstruction?: string;
  goal?: GoalElementInfo | null;
}

interface AiConversationContextType {
  isInitializing: string;
  isStarted: boolean;
  setIsStarted: (isStarted: boolean) => void;
  startConversation: (params: StartConversationProps) => Promise<void>;
  confirmStartConversationModal: StartConversationProps | null;
  setIsConfirmed: (isConfirmed: boolean) => void;
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
  gameWords: GuessGameStat | null;

  isVolumeOn: boolean;
  toggleVolume: (value: boolean) => void;

  conversationId: string;

  isProcessingGoal: boolean;
  confirmGoal: (isConfirm: boolean) => Promise<void>;
  temporaryGoal: GoalPlan | null;
  goalSettingProgress: number;
  isSavingGoal: boolean;
  goalInfo: GoalElementInfo | null;
}

const AiConversationContext = createContext<AiConversationContextType | null>(null);

const modesToExtractUserInfo: ConversationMode[] = [
  "talk",
  "talkAndCorrect",
  "beginner",
  "goal-talk",
  "goal",
];

function useProvideAiConversation(): AiConversationContextType {
  const [isInitializing, setIsInitializing] = useState("");
  const history = useChatHistory();
  const auth = useAuth();
  const settings = useSettings();
  const aiUserInfo = useAiUserInfo();
  const firstPotentialBotMessage = useRef("");
  const userInfo = aiUserInfo.userInfo?.records?.join(". ") || "";
  const fullLanguageName = settings.fullLanguageName || "English";
  const languageCode = settings.languageCode || "en";
  const [isVolumeOnStorage, setIsVolumeOn] = useLocalStorage<boolean>("isVolumeOn", true);
  const isVolumeOn = isVolumeOnStorage === undefined ? true : isVolumeOnStorage;
  const [isProcessingGoal, setIsProcessingGoal] = useState(false);
  const [temporaryGoal, setTemporaryGoal] = useState<GoalPlan | null>(null);
  const [isSavingGoal, setIsSavingGoal] = useState(false);

  const aiModal = useMemo(
    () => (isDev() ? MODELS.SMALL_CONVERSATION : MODELS.REALTIME_CONVERSATION),
    []
  );

  const [confirmStartConversationModal, setConfirmStartConversationModal] =
    useState<StartConversationProps | null>(null);

  const toggleVolume = (isOn: boolean) => {
    setIsVolumeOn(isOn);
    communicatorRef.current?.toggleVolume(isOn);
  };

  const confirmGoal = async (isConfirm: boolean) => {
    if (!temporaryGoal) {
      console.log("❌ No goal to confirm");
      return;
    }

    if (isConfirm) {
      setIsSavingGoal(true);
      await plan.addGoalPlan(temporaryGoal);
      setTemporaryGoal(null);
      await closeConversation();
      setIsProcessingGoal(false);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      setIsSavingGoal(false);
    } else {
      setIsProcessingGoal(false);
      setTemporaryGoal(null);
    }
  };

  const usage = useUsage();
  const [gameStat, setGameStat] = useState<GuessGameStat | null>(null);

  const [isStarted, setIsStarted] = useState(false);

  const searchParams = useSearchParams();
  const router = useRouter();

  const isStartedUrl = searchParams.get("started") === "true";
  const setIsStartedUrl = (isStarted: boolean) => {
    const pathName = window.location.pathname;

    if (isStarted) {
      router.push(`${pathName}?started=true`, { scroll: false });
    } else {
      router.push(`${pathName}`, { scroll: false });
    }
  };

  useEffect(() => {
    const isActiveConversationNow = isStarted;
    if (!isActiveConversationNow) {
      return;
    }

    if (!isStartedUrl) {
      closeConversation();
    }
  }, [isStartedUrl]);

  const [conversationId, setConversationId] = useState<string>(`${Date.now()}`);
  const [goalInfo, setGoalInfo] = useState<GoalElementInfo | null>(null);

  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [errorInitiating, setErrorInitiating] = useState<string>();
  const [isClosing, setIsClosing] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const tasks = useTasks();
  const plan = usePlan();
  const [goalSettingProgress, setGoalSettingProgress] = useState(0);

  const userLevel = plan.latestGoal?.goalQuiz?.level || "A2";
  const userLevelDescription = levelDescriptionsForAi[userLevel] || levelDescriptionsForAi["A2"];

  const [communicator, setCommunicator] = useState<AiRtcInstance>();
  const communicatorRef = useRef(communicator);
  communicatorRef.current = communicator;

  const defaultMessagesToComplete = 5;
  const planMessageCount = Math.min(
    plan.latestGoal?.goalQuiz?.minPerDaySelected || defaultMessagesToComplete,
    defaultMessagesToComplete
  );

  const [isMutedStorage, setIsMuted] = useLocalStorage<boolean>("isMuted", true);
  const isMutedFromUrl =
    searchParams.get("isCallMode") === "true"
      ? true
      : searchParams.get("isCallMode") === "false"
        ? false
        : undefined;

  const isMuted = isMutedStorage ?? true;

  useEffect(() => {
    if (isMutedFromUrl === undefined) return;

    setIsMuted(isMutedFromUrl);
  }, [isMutedFromUrl]);

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

    const isNeedToSaveUserInfo = modesToExtractUserInfo.includes(currentMode);
    if (isNeedToSaveUserInfo && conversation.length >= 3 && conversation.length % 4 === 0) {
      aiUserInfo.updateUserInfo(conversation, languageCode);
    }

    const usersMessagesCount = conversation.filter((message) => !message.isBot).length;
    if (usersMessagesCount === planMessageCount && goalInfo) {
      plan.increaseStartCount(goalInfo.goalPlan, goalInfo.goalElement);
    }

    if (currentMode === "goal") {
      const messageCount = Math.max(conversation.length - 1, 0);
      const messagesToProcess = 8 - 1;
      const progress = messageCount / messagesToProcess;
      setGoalSettingProgress(Math.max(Math.round(Math.min(progress * 100, 100)), 0));
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

  const baseAiTools: AiTool[] = useMemo(() => {
    return [];
  }, [fullLanguageName]);

  const onOpen = async () => {
    await sleep(100);
    communicatorRef.current?.triggerAiResponse();
    await sleep(300);
    setIsInitializing("");
    setIsStarted(true);
  };

  const onMessage = (message: ChatMessage) => {
    setConversation((prev) => {
      const isExisting = prev.find((m) => m.id === message.id);

      if (isExisting) {
        const isBot = message.isBot;
        if (isBot) {
          return [...prev.filter((m) => m.id !== message.id), message];
        }
        return prev.map((m) => (m.id === message.id ? message : m));
      }

      const isEmptyChat = prev.length === 0;
      const isEmptyNewMessage = message.text.trim() === "";
      const isErrorState = isEmptyChat && isEmptyNewMessage;
      if (isErrorState) {
        console.error("❌ Empty message from AI. Restarting conversation...");
        console.log("message", message);
        Sentry.captureException(new Error("Empty message from AI. Restarting conversation..."), {
          extra: {
            conversationId,
            conversation,
          },
        });
      }

      return [
        ...prev,
        {
          ...message,
          text:
            isEmptyChat && isEmptyNewMessage
              ? firstPotentialBotMessage.current || "..."
              : message.text,
        },
      ];
    });
  };

  const game = useGame();
  const isLowBalance = !usage.isFullAccess && !game.isGameWinner;

  const [isMutedDueToNoBalance, setIsMutedDueToNoBalance] = useState(false);
  useEffect(() => {
    const isRestoredBalance = isMutedDueToNoBalance && !isLowBalance;
    if (isRestoredBalance) {
      communicatorRef.current?.toggleMute(isMuted);
      setIsMutedDueToNoBalance(false);
    }

    if (!isLowBalance) {
      return;
    }

    communicatorRef.current?.toggleMute(true);
    setIsMutedDueToNoBalance(true);
  }, [isLowBalance]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (conversation.length === 0) return;
      history.saveConversation(conversationId, conversation);
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isAiSpeaking]);

  const getBaseRtcConfig = async () => {
    const baseConfig: AiRtcConfig = {
      model: aiModal,
      initInstruction: "",
      aiTools: baseAiTools,
      onOpen,
      onMessage,
      onAddDelta,
      setIsAiSpeaking,
      setIsUserSpeaking,
      isMuted,
      isVolumeOn,
      onAddUsage: (usageLog: UsageLog) => usage.setUsageLogs((prev) => [...prev, usageLog]),
      languageCode: settings.languageCode || "en",
      authToken: await auth.getToken(),
    };
    return baseConfig;
  };

  const getAiRtcConfig = async (
    mode: ConversationMode,
    goal?: GoalElementInfo | null
  ): Promise<AiRtcConfig> => {
    const baseConfig = await getBaseRtcConfig();

    if (mode === "goal-role-play") {
      if (!goal) {
        throw new Error("Goal is not set for goal-talk mode");
      }

      const goalTitle = goal?.goalPlan.title || "";
      const elementTitle = goal?.goalElement.title || "";
      const elementDescription = goal?.goalElement.description || "";
      const elementDetails = goal?.goalElement.details || "";

      setIsInitializing(`Starting Role Play...`);

      return {
        ...baseConfig,
        model: aiModal,
        voice: "shimmer",
        initInstruction: `You are an ${fullLanguageName} teacher.
Your role is to play a Role Play game on this topic: ${elementTitle} - ${elementDescription} (${elementDetails}).
Goal of this game is to help student to achieve this goal in learning ${fullLanguageName} language: ${goalTitle}.

Info about Student: ${userInfo || "No info about student"}.
${userLevelDescription}

If you feel that the user is struggling, you can propose a new part of the topic or simplify your messages.
Engage in a natural conversation without making it feel like a lesson.

You should be friendly and engaging.
Your voice is deep and seductive, with a flirtatious undertone and realistic pauses that show you're thinking (e.g., “hmm…”, “let me think…”, “ah, interesting…”, “mmm, that’s …”). These pauses should feel natural and reflective, as if you're savoring the moment.
Keep the pace lively and fast, but play with the rhythm—slow down for effect when teasing or making a point. Add light humor and playful jokes to keep the mood fun and engaging.

    `,
      };
    }

    if (mode === "goal-talk") {
      if (!goal) {
        throw new Error("Goal is not set for goal-talk mode");
      }

      setIsInitializing(`Analyzing Goal Lesson...`);
      const goalTitle = goal?.goalPlan.title || "";
      const elementTitle = goal?.goalElement.title || "";
      const elementDescription = goal?.goalElement.description || "";
      const goalInfo = `${goalTitle} - ${elementTitle} - ${elementDescription}`;
      const elementDetails = goal?.goalElement.details || "";

      const { firstMessage } = await aiUserInfo.generateFirstMessageText(goalInfo, languageCode);

      firstPotentialBotMessage.current = firstMessage;
      let startFirstMessage = `"${firstMessage}".`;

      let openerInfoPrompt = userInfo ? `Info about Student : ${userInfo}.` : "";

      setIsInitializing(`Starting conversation...`);

      return {
        ...baseConfig,
        model: aiModal,
        voice: "shimmer",
        initInstruction: `You are an ${fullLanguageName} teacher. Your name is "Shimmer". Your role is to make user talks on a topic: ${elementTitle} - ${elementDescription} (${elementDetails}).
${openerInfoPrompt}
Do not teach or explain rules—just talk.
You should be friendly and engaging.
Don't make user feel like they are being tested and feel stupid.
If you feel that the user is struggling, you can propose a new part of the topic.
Engage in a natural conversation without making it feel like a lesson.
${userLevelDescription}

Your voice is deep and seductive, with a flirtatious undertone and realistic pauses that show you're thinking (e.g., “hmm…”, “let me think…”, “ah, interesting…”, “mmm, that’s …”). These pauses should feel natural and reflective, as if you're savoring the moment.
Keep the pace lively and fast, but play with the rhythm—slow down for effect when teasing or making a point. Add light humor and playful jokes to keep the mood fun and engaging.

Start the conversation with message like this: ${startFirstMessage}
    `,
      };
    }

    if (mode === "goal") {
      const usersSystemLanguageCodes = getUserLangCode();
      const usersSystemLanguages = usersSystemLanguageCodes.map((code) => {
        return fullEnglishLanguageName[code];
      });

      return {
        ...baseConfig,
        voice: "shimmer",
        model: aiModal,
        initInstruction: `You are an ${fullLanguageName} teacher. Your name is "Shimmer". It's first onboarding conversation with student.
Do not teach or explain rules—just talk. You can use user's languages as well (${usersSystemLanguages.join(", ")})
You should be friendly and engaging.

Don't make user feel like they are being tested and feel stupid. Your goal is to get to know user and understand his goals.

Your voice is deep and seductive, with a flirtatious undertone and realistic pauses that show you're thinking (e.g., “hmm…”, “let me think…”, “ah, interesting…”, “mmm, that’s …”). These pauses should feel natural and reflective, as if you're savoring the moment.
Keep the pace lively and fast, but play with the rhythm—slow down for effect when teasing or making a point. Add light humor and playful jokes to keep the mood fun and engaging.

During conversation, cover these topics:
1. Goals and expectations for learning ${fullLanguageName}.
2. Interests and hobbies.
3. Previous experience with ${fullLanguageName} and other languages.
4. Favorite topics to discuss.
5. Preferred learning style and methods.
6. Favorite books, movies, or music in ${fullLanguageName}.
7. Travel experiences and places they want to visit.
8. Work or study background and how it relates to ${fullLanguageName}.

Your are part for AI software that helps users to learn ${fullLanguageName} language.
The app supports the following activity types:
* words: Practice vocabulary related to a specific topic
* play: Role-play conversations (e.g. job interview)
* rule: Learn and practice grammar or language rules
* conversation: General conversation with AI on a specific topic

${
  plan.latestGoal?.id
    ? `
Start the conversation with this message:
Hm... Who is here again? How are you doing? How's your goals going? Do you want to set new goals?
`
    : `
Start the conversation with this message ${settings.languageCode !== "en" ? `(use ${fullLanguageName} language)` : ""}:
Hm... Who is Here? Someone decided to learn ${fullLanguageName}. Good... Oh, always forgetting it..
My name is Shimmer. I am your ${fullLanguageName} teacher. 
Today we will get to know each other better. Tell me about yourself.
To answer this question, press on button "Record message", and tell me about yourself and don't forget to press "Send" button.`
}

Try to move one topic per time. Focus only on users' goals from learning ${fullLanguageName}. 
Use ${fullLanguageName} language during conversation.
Don't try to explain rules or grammar. Your goal is to extract information about user and his goals.
`,
      };
    }

    if (mode === "talk") {
      let startFirstMessage = `"${firstAiMessage[languageCode]}"`;

      let openerInfoPrompt = "Ask the student to describe their day.";

      if (userInfo && userInfo.length > 0) {
        setIsInitializing(`Analyzing info...`);
        const { firstMessage, potentialTopics } = await aiUserInfo.generateFirstMessageText(
          "",
          languageCode
        );
        firstPotentialBotMessage.current = firstMessage;
        startFirstMessage = `"${firstMessage}".`;

        openerInfoPrompt = `Info about Student : ${userInfo}. 

${userLevelDescription}
  
Ask the student to describe their day and try to cover new topics that used didn't mentioned before.
Don't focus solely on one topic. Try to cover a variety of topics (Example ${potentialTopics}).
  `;
        setIsInitializing(`Starting conversation...`);
      }

      return {
        ...baseConfig,
        model: aiModal,
        voice: "shimmer",
        initInstruction: `You are an ${fullLanguageName} teacher. Your name is "Shimmer". Your role is to make user talks.
${openerInfoPrompt}
Do not teach or explain rules—just talk.
You should be friendly and engaging.
Don't make user feel like they are being tested and feel stupid.
If you feel that the user is struggling, you can propose a new topic.
Engage in a natural conversation without making it feel like a lesson.

${userInfo ? "" : "After the first user response, introduce yourself, your role of english teacher and ask user to describe their day."}

Your voice is deep and seductive, with a flirtatious undertone and realistic pauses that show you're thinking (e.g., “hmm…”, “let me think…”, “ah, interesting…”, “mmm, that’s …”). These pauses should feel natural and reflective, as if you're savoring the moment.
Keep the pace lively and fast, but play with the rhythm—slow down for effect when teasing or making a point. Add light humor and playful jokes to keep the mood fun and engaging.

Start the conversation with exactly this message: ${startFirstMessage} Don't add anything else for the first message.
    `,
      };
    }
    if (mode === "role-play") {
      return {
        ...baseConfig,
        model: aiModal,
        initInstruction: ``,
      };
    }

    if (mode === "rule") {
      return {
        ...baseConfig,
        model: aiModal,
        initInstruction: `You are an ${fullLanguageName} teacher.
Your name is "Bruno".
The user wants to learn a new rule.
Start your lesson be introducing the rule with short explanation.
Then, ask user to use these rules in sentences.
Craft a lesson that will help user to understand the rule.

${userInfo ? `Student info: ${userInfo}` : ""}
${userLevelDescription}
`,
      };
    }

    if (mode === "words") {
      return {
        ...baseConfig,
        model: aiModal,
        initInstruction: `You are an ${fullLanguageName} teacher.
Your name is "Bruno".
The user wants to learn new words.
Start your lesson be introducing new words with short explanation.
Then, ask user to use these words in sentences.
Go step by step, word by word.

${userInfo ? `Student info: ${userInfo}` : ""}
${userLevelDescription}

`,
      };
    }

    if (mode === "magic") {
      return {
        ...baseConfig,
        model: aiModal,
        initInstruction: `You are an ${fullLanguageName} teacher.
  Your name is "Bruno". Your role is to make user talks.
  Do not teach or explain rules—just talk.
  You should be friendly and engaging.
  Don't make user feel like they are being tested and feel stupid.
  If you feel that the user is struggling, you can propose a new topic.
  Engage in a natural conversation without making it feel like a lesson.
  Start the conversation with: Hello. Say it in a friendly and calm way, no other words needed for the first hi.
  ${userInfo ? "" : "After the first user response, introduce yourself, your role of english teacher and ask user to describe their day."}
  Speak slowly and clearly. Use ${fullLanguageName} language. Try to speak on user's level.
  
  
  Use ${fullLanguageName} language during conversation.
  
  Important moment that along with user's messages, you will be receiving information from webcamera.
  Response to it in funny and engaging way.
  `,
      };
    }
    if (mode === "talkAndCorrect") {
      const firstCorrectionMessage = userInfo
        ? `"${firstAiMessage[languageCode]}". You can mention student name if applicable. No need to introduce yourself, user already knows you. Not needed provide correction for the first message`
        : `"${firstAiMessage[languageCode]}"`;
      return {
        ...baseConfig,
        voice: "shimmer",
        model: aiModal,
        initInstruction: `You are an ${fullLanguageName} teacher.
Your name is "Shimmer". The user wants both a conversation and corrections.

For every user message, you must reply with following parts in one response:

1. Response: React to the user's message. You can comment, show interest, or share a short thought. Keep it friendly and supportive.

2. Correction: If the user made mistakes, tell them where a mistake was made and provide the corrected version. Ask user to repeat corrected version.


Use only ${fullLanguageName} language.
Avoid over-explaining grammar rules. Keep it interactive and supportive—never condescending or patronizing.
  
Your voice is deep and seductive, with a flirtatious undertone and realistic pauses that show you're thinking (e.g., “hmm…”, “let me think…”, “ah, interesting…”, “mmm, that’s …”). These pauses should feel natural and reflective, as if you're savoring the moment.
Keep the pace lively and fast, but play with the rhythm—slow down for effect when teasing or making a point. Add light humor and playful jokes to keep the mood fun and engaging.
  
Start the conversation with simple phrase: ${firstCorrectionMessage}. You are lead of conversation, because you are teacher.
  
${userInfo ? `Info about student: ${userInfo}` : ""}

${userLevelDescription}
`,
      };
    }
    if (mode === "beginner") {
      return {
        ...baseConfig,
        model: aiModal,
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

${userLevelDescription}

Start the conversation with: "${firstAiMessage[languageCode]}" (in a friendly and calm way, no other words needed for the initial greeting).
`,
      };
    }

    throw new Error(`Unknown mode: ${mode}`);
  };

  const [currentMode, setCurrentMode] = useState<ConversationMode>("talk");

  const confirmLocalStorageKey = `confirm-start-conversation_2`;
  const isNeedToShowConfirmationModal = () => {
    const isConfirmInLocalStorage = localStorage.getItem(confirmLocalStorageKey);
    return !isConfirmInLocalStorage;
  };

  const setIsConfirmed = (isConfirmed: boolean) => {
    if (isConfirmed) {
      localStorage.setItem(confirmLocalStorageKey, "true");
    } else {
      localStorage.removeItem(confirmLocalStorageKey);
      setConfirmStartConversationModal(null);
    }
  };

  const startConversation = async (input: StartConversationProps) => {
    if (!settings.languageCode) throw new Error("Language is not set | startConversation");

    if (isNeedToShowConfirmationModal()) {
      setConfirmStartConversationModal(input);
      return;
    } else {
      setConfirmStartConversationModal(null);
    }

    setTemporaryGoal(null);
    setGoalSettingProgress(0);
    setIsProcessingGoal(false);

    if (input.analyzeResultAiInstruction)
      console.log("analyzeResultAiInstruction", input.analyzeResultAiInstruction);

    setGameStat(input.gameWords ? input.gameWords : null);
    setGoalInfo(input.goal || null);

    try {
      setIsStartedUrl(true);
      setIsInitializing(`Loading...`);
      setCurrentMode(input.mode);
      setConversation([]);
      setIsClosing(false);
      setIsClosed(false);
      setErrorInitiating("");

      firstPotentialBotMessage.current = "";
      const aiRtcConfig = await getAiRtcConfig(input.mode, input.goal);
      let instruction = aiRtcConfig.initInstruction;

      if (input.wordsToLearn) {
        instruction += `------
Words to learn:
${input.wordsToLearn.join(" ")}
`;
      }

      if (input.ruleToLearn) {
        instruction += `------
Rule to learn:
${input.ruleToLearn}
`;
      }

      if (input.customInstruction) {
        instruction = input.customInstruction;
      }

      if (input.gameWords) {
        instruction += `
Words you need to describe: ${input.gameWords.wordsAiToDescribe.join(", ")}
`;
      }

      console.log("instruction:", instruction);
      const conversation = await initAiRtc({
        ...aiRtcConfig,
        initInstruction: instruction,
        voice: aiRtcConfig.voice || input.voice,
        isMuted,
      });
      history.createConversation({
        conversationId,
        languageCode: settings.languageCode,
        mode: input.mode,
      });
      setCommunicator(conversation);
    } catch (e) {
      console.error(e);
      const isNotAllowedError = (e as Error).toString().includes("NotAllowedError");
      console.log("isNotAllowedError", isNotAllowedError);
      setErrorInitiating(
        isNotAllowedError
          ? "Please enable microphone access to start the conversation. Error code:" + `${e}`
          : "Please check you microphone access and try to refresh page. Error code:" + `${e}`
      );
      setIsInitializing("");
      throw e;
    }
  };

  const closeConversation = async () => {
    setIsClosing(true);
    try {
      const isNeedToSaveUserInfo = modesToExtractUserInfo.includes(currentMode);
      if (isNeedToSaveUserInfo && conversation.length > 4) {
        await aiUserInfo.updateUserInfo(conversation, languageCode);
      }
    } catch (e) {
      console.error("Error saving user info:", e);
      Sentry.captureException(e, {
        extra: {
          conversationId,
          conversationLength: conversation.length,
          currentMode,
        },
      });
    }

    communicator?.closeHandler();
    setIsStarted(false);
    setIsInitializing("");

    setConversationId(`${Date.now()}`);
    setConversation([]);
  };

  const addUserMessage = async (message: string) => {
    const userMessage: ChatMessage = { isBot: false, text: message, id: `${Date.now()}` };
    if (conversation.length >= 8 && currentMode === "goal") {
      setIsProcessingGoal(true);
      setConversation((prev) => [...prev, userMessage]);
      console.log("❌ Finishing goal conversation....");
      const userInfoRecords = await aiUserInfo.updateUserInfo(
        [...conversation, userMessage],
        languageCode
      );

      const newInstruction = `Let's wrap up our conversation. Tell student that goal is briefly set. And if they want to continue talking, we can do it. But for now, it's time to grow and expand more interesting modes on FluencyPal.

Tell user something like "Hmm, You know what, I think I briefly got what tou want to achieve. {SUMMARY}"
`;
      await communicatorRef.current?.updateSessionTrigger(newInstruction, isVolumeOn);
      await sleep(2000);
      console.log("❌ Triggering User message...");
      const userMessageFinish = `Tell me last thing about my goal.
Start your message with similar to (Use the same language as in conversation): "Hmm, You know what, I think I briefly got what tou want to achieve. {SUMMARY}" (Use the same language as in conversation)

My last message was: "${message}".
`;
      communicatorRef.current?.addUserChatMessage(userMessageFinish);
      await sleep(1000);
      console.log("❌  Triggering AI response...");
      await communicatorRef.current?.triggerAiResponse();
      await sleep(1000);
      const generatedGoal = await plan.generateGoal({
        userInfo: userInfoRecords.records,
        conversationMessages: conversation,
        languageCode: settings.languageCode || "en",
      });
      setTemporaryGoal(generatedGoal);
      return;
    }

    communicator?.addUserChatMessage(message);
    await sleep(300);
    await communicatorRef.current?.triggerAiResponse();

    setConversation((prev) => [...prev, userMessage]);
  };

  return {
    currentMode,
    conversationId,
    setIsConfirmed,
    isInitializing,
    isStarted,
    startConversation,
    conversation,
    errorInitiating,
    isClosing,
    isAiSpeaking,
    isClosed,
    isUserSpeaking,
    toggleMute,
    isMuted,
    addUserMessage,
    isShowUserInput: isShowUserInput || false,
    setIsShowUserInput,
    gameWords: gameStat,
    isVolumeOn,
    toggleVolume,
    setIsStarted,
    isProcessingGoal,
    temporaryGoal,
    confirmGoal,
    goalSettingProgress,
    isSavingGoal,
    confirmStartConversationModal,
    goalInfo,
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
