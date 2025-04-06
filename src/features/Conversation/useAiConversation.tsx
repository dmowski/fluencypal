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
import { sleep } from "@/libs/sleep";
import { useAiUserInfo } from "../Ai/useAiUserInfo";
import { GuessGameStat } from "./types";
import { useAuth } from "../Auth/useAuth";
import { firstAiMessage, fullEnglishLanguageName, getUserLangCode } from "@/common/lang";

const aiModal = MODELS.SMALL_CONVERSATION;

interface StartConversationProps {
  mode: ConversationMode;
  homework?: Homework;
  wordsToLearn?: string[];
  ruleToLearn?: string;
  voice?: AiVoice;
  customInstruction?: string;
  gameWords?: GuessGameStat;
  analyzeResultAiInstruction?: string;
}

interface AiConversationContextType {
  isSavingHomework: boolean;
  isInitializing: string;
  isStarted: boolean;
  setIsStarted: (isStarted: boolean) => void;
  startConversation: (params: StartConversationProps) => Promise<void>;
  closeConversation: () => Promise<void>;
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
}

const AiConversationContext = createContext<AiConversationContextType | null>(null);

const modesWithHomework: ConversationMode[] = ["talk", "talkAndCorrect", "beginner"];
const modesToExtractUserInfo: ConversationMode[] = ["talk", "talkAndCorrect", "beginner"];
const isNeedToGenerateFirstMessage: ConversationMode[] = ["talk", "beginner"];

function useProvideAiConversation(): AiConversationContextType {
  const [isInitializing, setIsInitializing] = useState("");
  const history = useChatHistory();
  const auth = useAuth();
  const settings = useSettings();
  const aiUserInfo = useAiUserInfo();
  const [activeHomework, setActiveHomework] = useState<Homework | null>(null);
  const firstPotentialBotMessage = useRef("");
  const userInfo = aiUserInfo.userInfo?.records?.join(". ") || "";
  const fullLanguageName = settings.fullLanguageName || "English";
  const languageCode = settings.languageCode || "en";
  const [analyzeResultInstruction, setAnalyzeResultInstruction] = useState<string>("");
  const [isVolumeOnStorage, setIsVolumeOn] = useLocalStorage<boolean>("isVolumeOn", true);
  const isVolumeOn = isVolumeOnStorage === undefined ? true : isVolumeOnStorage;

  const toggleVolume = (isOn: boolean) => {
    setIsVolumeOn(isOn);
    communicatorRef.current?.toggleVolume(isOn);
  };

  const usage = useUsage();
  const [gameStat, setGameStat] = useState<GuessGameStat | null>(null);

  const [isStarted, setIsStarted] = useState(false);

  /*
  const searchParams = useSearchParams();
  const router = useRouter();

  // todo: sync it with url
  const isStartedInternal = searchParams.get("started") === "true";
  const setIsStartedInternal = (isStarted: boolean) => {
    const pathName = window.location.pathname;

    if (isStarted) {
      router.push(`${pathName}?started=true`, { scroll: false });
    } else {
      router.push(`${pathName}`, { scroll: false });
    }
  };
  */

  const homeworkService = useHomework();
  const [conversationId, setConversationId] = useState<string>(`${Date.now()}`);

  const [conversation, setConversation] = useState<ChatMessage[]>([]);
  const [errorInitiating, setErrorInitiating] = useState<string>();
  const [isClosing, setIsClosing] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
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

    if (conversation.length === 10) {
      if (currentMode === "goal") {
        const isFirstAttempt = !userInfo;

        if (isFirstAttempt) {
          //
          console.log("❌ Finishing goal conversation....");
          aiUserInfo.updateUserInfo(conversation).then(async () => {
            console.log("Triggering wrap up instruction...");
            const newInstruction = `Let's wrap up our conversation. Tell student that goal is briefly set. And if they want to continue talking, we can do it. But for now, it's time to grow and expand more interesting modes on FluencyPal.

Tell user something like "Okey, I think we have a good understanding of your goals. If you want to continue talking, we can do it. But for now, let's focus on expanding your skills in more interesting modes on FluencyPal. Let's grow together!

To finish the onboarding, press the back button on the top left corner of the screen.
".
`;
            await communicatorRef.current?.updateSessionTrigger(newInstruction, isVolumeOn);
            await sleep(5000);
            console.log("❌ Triggering User message...");
            const userMessageFinish = "Can we finish our conversation?";
            communicatorRef.current?.addUserChatMessage(userMessageFinish);
            await sleep(1000);
            console.log("❌  Triggering AI response...");
            await communicatorRef.current?.triggerAiResponse();
          });
        }
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
    const newInstruction = analyzeResultInstruction
      ? analyzeResultInstruction
      : isNeedHomework
        ? newInstructionForHomework
        : generalSummary;

    const isNeedToSaveUserInfo = modesToExtractUserInfo.includes(currentMode);
    if (isNeedToSaveUserInfo) {
      await aiUserInfo.updateUserInfo(conversation);
    }

    console.log("FINISHING THE LESSON. AI new Instruction to update session", newInstruction);
    await communicatorRef.current?.updateSessionTrigger(newInstruction, isVolumeOn);
    await sleep(700);

    const endUserMessageHomework =
      "I am done for today. Create a text I have to repeat on the next lesson. Don't add anything else. Just give me homework";
    const endUserMessageJustAnalyze =
      "I am done for today. Show me my mistakes and make general comments. Don't add anything else. Just give me feedback";
    const endUserMessage = analyzeResultInstruction
      ? `Let's finish conversation. Analyze our conversations. Use ${fullLanguageName} language during providing feedback. Give me feedback and show places to improve.`
      : isNeedHomework
        ? endUserMessageHomework
        : endUserMessageJustAnalyze;

    console.log("endUserMessage", endUserMessage);
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
    setIsInitializing("");
    setIsStarted(true);
  };

  const onMessage = (message: ChatMessage) => {
    setConversation((prev) => {
      const isExisting = prev.find((m) => m.id === message.id);

      if (isExisting) {
        return prev.map((m) => (m.id === message.id ? message : m));
      }

      const isEmptyChat = prev.length === 0;
      const isEmptyNewMessage = message.text.trim() === "";

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

  const isLowBalance = usage.balanceHours < 0.01;
  const [isMutedDueToNoBalance, setIsMutedDueToNoBalance] = useState(false);
  useEffect(() => {
    const isRestoredBalance = isMutedDueToNoBalance && !isLowBalance;
    if (isRestoredBalance) {
      communicatorRef.current?.toggleMute(isMuted || false);
      setIsMutedDueToNoBalance(false);
    }

    if (!isLowBalance) {
      return;
    }

    communicatorRef.current?.toggleMute(true);
    setIsMutedDueToNoBalance(true);
  }, [isLowBalance]);

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
      isMuted: isMuted || false,
      isVolumeOn,
      onAddUsage: (usageLog: UsageLog) => usage.setUsageLogs((prev) => [...prev, usageLog]),
      languageCode: settings.languageCode || "en",
      authToken: await auth.getToken(),
    };
    return baseConfig;
  };

  const getAiRtcConfig = async (mode: ConversationMode): Promise<AiRtcConfig> => {
    const baseConfig = await getBaseRtcConfig();

    if (mode === "goal") {
      const usersSystemLanguageCodes = getUserLangCode();
      const usersSystemLanguages = usersSystemLanguageCodes.map((code) => {
        return fullEnglishLanguageName[code];
      });

      return {
        ...baseConfig,
        voice: "shimmer",
        model: MODELS.SMALL_CONVERSATION,
        initInstruction: `You are an ${fullLanguageName} teacher. Your name is "Shimmer". It's first lesson with user.
Do not teach or explain rules—just talk. You can use user's languages as well (${usersSystemLanguages.join(", ")})
You should be friendly and engaging.

Don't make user feel like they are being tested and feel stupid.
Your goal is to get to know user and understand his goals.


Your voice is deep and seductive, with a flirtatious undertone and realistic pauses that show you're thinking (e.g., “hmm…”, “let me think…”, “ah, interesting…”, “mmm, that’s …”). These pauses should feel natural and reflective, as if you're savoring the moment.
Keep the pace lively and fast, but play with the rhythm—slow down for effect when teasing or making a point. Add light humor and playful jokes to keep the mood fun and engaging.

During conversation, cover these topics:
1. User's goals and expectations for learning ${fullLanguageName}.
2. User's interests and hobbies.
3. User's previous experience with ${fullLanguageName} and other languages.
4. User's favorite topics to discuss.
5. User's preferred learning style and methods.
6. User's favorite books, movies, or music in ${fullLanguageName}.
7. User's travel experiences and places they want to visit.
8. User's work or study background and how it relates to ${fullLanguageName}.
9. User's cultural background and how it influences their language learning.
10. User's favorite activities or pastimes related to ${fullLanguageName}.
11. User's favorite food and cooking experiences.


${
  userInfo
    ? `
Here is the info from user (Don't ask user about it again):
${userInfo} 
`
    : ""
}




${
  userInfo
    ? `
Hm... Who is Here again? How are you doing? How's your goals going? Do you want to set new goals?
`
    : `
Start the conversation with this message:
Hm... Who is Here? Someone decided to learn ${fullLanguageName}. Good... Oh, always forgetting it..
My name is Shimmer. I am your ${fullLanguageName} teacher. 
Today we will get to know each other better. Tell me about yourself.
To answer this question, press on button "Record message", and tell me about yourself and don't forget to press "Send" button.`
}

Try to move one topic per time. Focus only on users' goals from learning ${fullLanguageName}.
`,
      };
    }

    if (mode === "talk") {
      let startFirstMessage = `"${firstAiMessage[languageCode]}"`;

      let openerInfoPrompt = "Ask the student to describe their day.";

      if (userInfo && userInfo.length > 0) {
        setIsInitializing(`Analyzing info...`);
        const { firstMessage, potentialTopics } = await aiUserInfo.generateFirstMessageText();
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
        model: MODELS.SMALL_CONVERSATION,
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

Start the conversation with: "${firstAiMessage[languageCode]}" (in a friendly and calm way, no other words needed for the initial greeting).
  `,
      };
    }

    throw new Error(`Unknown mode: ${mode}`);
  };

  const [currentMode, setCurrentMode] = useState<ConversationMode>("talk");

  const startConversation = async ({
    mode,
    homework,
    wordsToLearn,
    ruleToLearn,
    customInstruction,
    voice,
    gameWords,
    analyzeResultAiInstruction,
  }: StartConversationProps) => {
    if (!settings.languageCode) throw new Error("Language is not set | startConversation");

    setAnalyzeResultInstruction(analyzeResultAiInstruction || "");
    if (analyzeResultAiInstruction)
      console.log("analyzeResultAiInstruction", analyzeResultAiInstruction);

    setGameStat(gameWords ? gameWords : null);

    try {
      setConversation([]);
      setIsClosing(false);
      setIsClosed(false);
      setErrorInitiating("");
      setIsInitializing(`Loading...`);
      setCurrentMode(mode);
      firstPotentialBotMessage.current = "";
      const aiRtcConfig = await getAiRtcConfig(mode);
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

      if (gameWords) {
        instruction += `
Words you need to describe: ${gameWords.wordsAiToDescribe.join(", ")}
`;
      }

      console.log("instruction:", instruction);
      const conversation = await initAiRtc({
        ...aiRtcConfig,
        initInstruction: instruction,
        voice: aiRtcConfig.voice || voice,
        isMuted: true,
      });
      history.createConversation({ conversationId, languageCode: settings.languageCode, mode });
      setCommunicator(conversation);
    } catch (e) {
      console.error(e);
      alert("Something went wrong. Try again later");
      setErrorInitiating("Something went wrong. Try again later");
      setIsInitializing("");
      throw e;
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
      languageCode: settings.languageCode || "en",
    });
  };

  const closeConversation = async () => {
    setIsClosing(true);
    const isNeedToSaveUserInfo = modesToExtractUserInfo.includes(currentMode);
    if (isNeedToSaveUserInfo && conversation.length > 4) {
      console.log("updateUserInfo", conversation);
      await aiUserInfo.updateUserInfo(conversation);
    }

    communicator?.closeHandler();
    setIsStarted(false);
    setIsInitializing("");

    setConversationId(`${Date.now()}`);
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
    conversationId,
    isSavingHomework,
    isInitializing,
    isStarted,
    startConversation,
    closeConversation,
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
    gameWords: gameStat,
    isVolumeOn,
    toggleVolume,
    setIsStarted,
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
