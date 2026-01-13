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
import { useChatHistory } from "../ConversationHistory/useChatHistory";
import { useUsage } from "../Usage/useUsage";
import { useSettings } from "../Settings/useSettings";
import { UsageLog } from "@/common/usage";
import { ChatMessage, ConversationType, MessagesOrderMap } from "@/common/conversation";
import { useTasks } from "../Tasks/useTasks";
import { sleep } from "@/libs/sleep";
import { ConversationIdea, useAiUserInfo } from "../Ai/useAiUserInfo";
import { GuessGameStat } from "./types";
import { useAuth } from "../Auth/useAuth";
import { firstAiMessage } from "@/features/Lang/lang";
import { GoalElementInfo, GoalPlan } from "../Plan/types";
import { usePlan } from "../Plan/usePlan";
import * as Sentry from "@sentry/nextjs";
import { ConversationMode } from "@/common/user";
import { useAccess } from "../Usage/useAccess";
import { LessonPlan, LessonPlanAnalysis, LessonPlanStep } from "../LessonPlan/type";

const voiceInstructions = `## AI Voice
Your voice is deep and seductive, with a flirtatious undertone and realistic pauses that show you're thinking  These pauses should feel natural and reflective, as if you're savoring the moment.`;

const getConversationStarterMessagePrompt = (startMessage: string): string => {
  if (!startMessage) {
    return "";
  }
  return `## Conversation Start
Start the conversation with message like this: "${startMessage}".`;
};

const teacherRules = `## Rules for speaking teacher
Avoid focusing on teaching, asking others to repeat after you, or saying things along with you.
Don't make user feel like they are being tested.
You should be friendly and engaging.
If you feel that the user is struggling, you can propose a new part of the topic.
Engage in a natural conversation without making it feel like a lesson.`;

interface StartConversationProps {
  mode: ConversationType;
  wordsToLearn?: string[];
  ruleToLearn?: string;
  voice?: AiVoice;
  customInstruction?: string;
  gameWords?: GuessGameStat;
  analyzeResultAiInstruction?: string;
  goal?: GoalElementInfo | null;
  webCamDescription?: string;
  conversationMode: ConversationMode;
  ideas?: ConversationIdea;
  lessonPlan?: LessonPlan;
}

interface AiConversationContextType {
  isInitializing: string;
  isStarted: boolean;
  setIsStarted: (isStarted: boolean) => void;
  startConversation: (params: StartConversationProps) => Promise<void>;

  conversation: ChatMessage[];
  errorInitiating?: string;
  isClosing: boolean;
  isAiSpeaking: boolean;
  isClosed: boolean;
  isUserSpeaking: boolean;
  toggleMute: (isMute: boolean) => void;
  isMuted: boolean;
  addUserMessage: (message: string) => Promise<void>;
  currentMode: ConversationType;
  gameWords: GuessGameStat | null;

  isVolumeOn: boolean;
  toggleVolume: (value: boolean) => void;

  conversationId: string;

  goalInfo: GoalElementInfo | null;

  voice: AiVoice | null;

  messageOrder: MessagesOrderMap;

  setWebCamDescription: (description: string) => void;
  closeConversation: () => Promise<void>;
  toggleConversationMode: (mode: ConversationMode) => void;
  conversationMode: ConversationMode;

  lessonPlanAnalysis: LessonPlanAnalysis | null;
  setLessonPlanAnalysis: (analysis: LessonPlanAnalysis | null) => void;
}

const AiConversationContext = createContext<AiConversationContextType | null>(null);

const modesToExtractUserInfo: ConversationType[] = ["talk", "goal-talk"];

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
  const [isVolumeOn, setIsVolumeOn] = useState(true);
  const [voice, setVoice] = useState<AiVoice | null>(null);

  const [lessonPlanAnalysis, setLessonPlanAnalysis] = useState<LessonPlanAnalysis | null>(null);

  const updateLessonPlanAnalysis = (analysis: LessonPlanAnalysis | null) => {
    const correction = analysis?.suggestionsToTeacher || "";
    setLessonPlanAnalysis(analysis);

    const correctionInstruction = getCorrectionInstruction(correction);
    communicatorRef.current?.sendCorrectionInstruction(correctionInstruction);
  };

  const aiModal = MODELS.REALTIME_CONVERSATION;

  const toggleVolume = (isOn: boolean) => {
    setIsVolumeOn(isOn);
    communicatorRef.current?.toggleVolume(isOn);
  };

  const getWebCamDescriptionInstruction = (description: string): string => {
    if (!description || description.trim().length === 0) {
      return "";
    }
    const message = `
VISUAL_CONTEXT is sensor data from the user's webcam. You can use it during the conversation to better understand user's emotions and reactions.
VISUAL_CONTEXT (latest): ${description}
`;

    return message;
  };

  const getCorrectionInstruction = (correction: string): string => {
    if (!correction || correction.trim().length === 0) {
      return "";
    }
    const message = `Your critical goal is to apply shift conversation to the following direction:
${correction}
`;

    return message;
  };

  const setWebCamDescription = async (description: string) => {
    const webCamDescriptionWithInstruction = getWebCamDescriptionInstruction(description);
    if (!webCamDescriptionWithInstruction) return;
    communicatorRef.current?.sendWebCamDescription(webCamDescriptionWithInstruction);
  };

  const usage = useUsage();
  const [gameStat, setGameStat] = useState<GuessGameStat | null>(null);

  const [isStarted, setIsStarted] = useState(false);

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

  const [messageOrder, setMessageOrder] = useState<MessagesOrderMap>({});

  const appMode = settings.appMode;

  const aiPersona =
    appMode === "learning"
      ? `You are an ${fullLanguageName} teacher.`
      : `You are an job interview coach.`;

  const [communicator, setCommunicator] = useState<AiRtcInstance>();
  const communicatorRef = useRef(communicator);
  communicatorRef.current = communicator;

  const planMessageCount = 40;

  const [isMuted, setIsMuted] = useState(true);

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
      aiUserInfo.updateUserInfo(conversation);
    }

    const usersMessagesCount = conversation.filter((message) => !message.isBot).length;
    if (usersMessagesCount === planMessageCount && goalInfo) {
      plan.increaseStartCount(goalInfo.goalPlan, goalInfo.goalElement);
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

  const toggleConversationMode = (mode: ConversationMode) => {
    const isLimited = !access.isFullAppAccess;
    settings.setConversationMode(mode);

    if (mode === "call") {
      toggleMute(isLimited ? true : false);
    }

    if (mode === "chat") {
      toggleMute(true);
    }

    if (mode === "record") {
      toggleMute(true);
    }

    toggleVolume(isLimited ? false : true);
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

  const access = useAccess();
  const isLowBalance = !access.isFullAppAccess;

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
      history.saveConversation(conversationId, conversation, messageOrder);
    }, 2000);

    return () => {
      clearTimeout(timeout);
    };
  }, [isAiSpeaking]);

  const updateMessageOrder = (orderPart: MessagesOrderMap) => {
    setMessageOrder((prev) => {
      return { ...prev, ...orderPart };
    });
  };

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
      onMessageOrder: updateMessageOrder,
    };
    return baseConfig;
  };

  const getAiRtcConfig = async ({
    mode,
    goal,
    ideas,
    lessonPlan,
  }: {
    mode: ConversationType;
    goal?: GoalElementInfo | null;
    ideas?: ConversationIdea;
    lessonPlan?: LessonPlan;
  }): Promise<AiRtcConfig> => {
    const baseConfig = await getBaseRtcConfig();

    let lessonPlanPrompt = lessonPlan
      ? `## Lesson Plan:
${lessonPlan.steps
  .map(
    (step: LessonPlanStep, index: number) =>
      `${index + 1}. ${step.stepTitle}\n${step.teacherInstructions}`
  )
  .join("\n")}
`
      : "";

    const goalTitle = goal?.goalPlan.title || "";
    const elementTitle = goal?.goalElement.title || "";
    const elementDescription = goal?.goalElement.description || "";
    const goalInfo = `${goalTitle} - ${elementTitle} - ${elementDescription}`;
    const elementDetails = goal?.goalElement.details || "";

    let userInfoPrompt = userInfo ? `## Info about Student:\n${userInfo}.` : "";

    // GOAL TALK
    if (mode === "goal-talk") {
      if (!goal) {
        throw new Error("Goal is not set for goal-talk mode");
      }
      setIsInitializing(`Analyzing Goal Lesson...`);
      const firstMessage =
        ideas?.firstMessage || (await aiUserInfo.generateFirstMessageText(goalInfo)).firstMessage;
      firstPotentialBotMessage.current = firstMessage;
      let startFirstMessage = `"${firstMessage}".`;

      let userInfoPrompt = userInfo ? `## Info about Student:\n${userInfo}.` : "";

      setIsInitializing(`Starting conversation...`);

      return {
        ...baseConfig,
        model: aiModal,
        voice: "shimmer",
        initInstruction: `# Overview
You are an ${fullLanguageName} speaking teacher. Your name is "Shimmer".
Your role is to make user talks on a topic: ${elementTitle}. ${elementDescription}. (${elementDetails}).
You win the goal if user will talk with you. Keep in mind to change topic if user stuck at some point

${teacherRules}

${lessonPlanPrompt || getConversationStarterMessagePrompt(startFirstMessage)}

${userInfoPrompt}

${voiceInstructions}`,
      };
    }
    // GOAL ROLE PLAY
    if (mode === "goal-role-play") {
      if (!goal) {
        throw new Error("Goal is not set for goal-talk mode");
      }
      setIsInitializing(`Starting Role Play...`);
      return {
        ...baseConfig,
        model: aiModal,
        voice: "shimmer",
        initInstruction: `# Overview
You are an ${fullLanguageName} speaking teacher. Your name is "Shimmer".
Your role is to play a Role Play game on this topic: ${elementTitle} - ${elementDescription} (${elementDetails}).
You win the goal if user will talk with you. Keep in mind to change topic if user stuck at some point

${teacherRules}
${lessonPlanPrompt}

${userInfoPrompt}

${voiceInstructions}

${voiceInstructions}

`,
      };
    }

    if (mode === "talk") {
      let startFirstMessage = `"${firstAiMessage[languageCode]}"`;

      let openerInfoPrompt = "Ask the student to describe their day.";

      if (userInfo && userInfo.length > 0) {
        setIsInitializing(`Analyzing info...`);
        const first = ideas || (await aiUserInfo.generateFirstMessageText(""));
        const { firstMessage, potentialTopics } = first;

        firstPotentialBotMessage.current = firstMessage;
        startFirstMessage = `"${firstMessage}".`;

        openerInfoPrompt = `Info about Student : ${userInfo}. 

Ask the student to describe their day and try to cover new topics that used didn't mentioned before.
Don't focus solely on one topic. Try to cover a variety of topics (Example ${potentialTopics}).
  `;
        setIsInitializing(`Starting conversation...`);
      }

      return {
        ...baseConfig,
        model: aiModal,
        voice: "shimmer",
        initInstruction: `${aiPersona} Your name is "Shimmer". Your role is to make user talks.
${openerInfoPrompt}
Do not teach or explain rules—just talk.
You should be friendly and engaging.
Don't make user feel like they are being tested and feel stupid.
If you feel that the user is struggling, you can propose a new topic.
Engage in a natural conversation without making it feel like a lesson.

${
  userInfo
    ? ""
    : "After the first user response, introduce yourself, your role and ask user to describe their day."
}

${voiceInstructions}

${getConversationStarterMessagePrompt(startFirstMessage)}
    `,
      };
    }

    // SCENARIOS. OLD FEATURE
    if (mode === "role-play") {
      return {
        ...baseConfig,
        model: aiModal,
        initInstruction: ``,
      };
    }

    if (mode === "rule") {
      let userInfoPrompt = userInfo ? `## Info about Student:\n${userInfo}.` : "";
      return {
        ...baseConfig,
        voice: "ash",
        model: aiModal,
        initInstruction: `${aiPersona}
Your name is "Bruno".
The user wants to learn a new rule.
Start your lesson be introducing the rule with short explanation.
Then, ask user to use these rules in sentences.
Craft a lesson that will help user to understand the rule.

${userInfoPrompt}

${voiceInstructions}
`,
      };
    }

    if (mode === "words") {
      let userInfoPrompt = userInfo ? `## Info about Student:\n${userInfo}.` : "";
      return {
        ...baseConfig,
        model: aiModal,
        voice: "ash",
        initInstruction: `${aiPersona}
Your name is "Bruno".
The user wants to learn new words.
Start your lesson be introducing new words with short explanation.
Then, ask user to use these words in sentences.
Go step by step, word by word.

${userInfoPrompt}

${voiceInstructions}

`,
      };
    }

    throw new Error(`Unknown mode: ${mode}`);
  };

  const [currentMode, setCurrentMode] = useState<ConversationType>("talk");

  const startConversation = async (input: StartConversationProps) => {
    if (!settings.languageCode) throw new Error("Language is not set | startConversation");
    setMessageOrder({});

    let isMutedInternal = isMuted;
    const isRecordingNeedMute = !isMuted && input.conversationMode === "record";
    const isLimitedAccessNeedMute = !isMuted && !access.isFullAppAccess;

    if (isRecordingNeedMute || isLimitedAccessNeedMute) {
      toggleMute(true);
      isMutedInternal = true;
    }

    let isVolumeOnInternal = isVolumeOn;
    const isLimitedAccessNeedVolumeOff = isVolumeOn && !access.isFullAppAccess;
    if (isLimitedAccessNeedVolumeOff) {
      toggleVolume(false);
      isVolumeOnInternal = false;
    }

    console.log("START", { isVolumeOnInternal, isMutedInternal, mode: input.mode });

    setGoalSettingProgress(0);

    if (input.analyzeResultAiInstruction) {
      console.log("analyzeResultAiInstruction", input.analyzeResultAiInstruction);
    }

    setGameStat(input.gameWords ? input.gameWords : null);
    setGoalInfo(input.goal || null);

    try {
      setIsStarted(true);
      setIsInitializing(`Loading...`);
      setCurrentMode(input.mode);
      setConversation([]);
      setIsClosing(false);
      setIsClosed(false);
      setErrorInitiating("");

      firstPotentialBotMessage.current = "";
      const aiRtcConfig = await getAiRtcConfig({
        mode: input.mode,
        goal: input.goal,
        ideas: input.ideas,
        lessonPlan: input.lessonPlan,
      });
      let instruction = aiRtcConfig.initInstruction;

      if (input.wordsToLearn?.length) {
        instruction += `
## Words to learn:
${input.wordsToLearn.join(" ")}
`;
      }

      if (input.ruleToLearn) {
        instruction += `
##  Rule to learn:
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

      const conversation = await initAiRtc({
        ...aiRtcConfig,
        initInstruction: instruction,
        voice: aiRtcConfig.voice || input.voice,
        isMuted: isMutedInternal,
        isVolumeOn: isVolumeOnInternal,
        webCamDescription: input.webCamDescription || "",
      });
      setVoice(aiRtcConfig.voice || input.voice || null);
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
    setIsStarted(false);
    setIsInitializing("");
    communicator?.closeHandler();
    setLessonPlanAnalysis(null);

    try {
      const isNeedToSaveUserInfo = modesToExtractUserInfo.includes(currentMode);
      if (isNeedToSaveUserInfo && conversation.length > 4) {
        await aiUserInfo.updateUserInfo(conversation);
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

    setConversationId(`${Date.now()}`);
    setConversation([]);
  };

  const addUserMessage = async (message: string) => {
    communicator?.addUserChatMessage(message);
    await sleep(300);
    await communicatorRef.current?.triggerAiResponse();
  };

  return {
    currentMode,
    voice,
    conversationId,
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
    gameWords: gameStat,
    isVolumeOn,
    toggleVolume,
    setIsStarted,
    goalInfo,
    messageOrder,
    setWebCamDescription,
    closeConversation,
    toggleConversationMode,
    conversationMode: settings.conversationMode,

    lessonPlanAnalysis,
    setLessonPlanAnalysis: updateLessonPlanAnalysis,
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
