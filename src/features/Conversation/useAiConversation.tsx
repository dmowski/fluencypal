'use client';

import { createContext, useContext, ReactNode, JSX, useEffect, useRef, useState } from 'react';
import { AiVoice, MODELS } from '@/common/ai';

import { initWebRtcConversation } from './ConversationInstance/webRtc';

import { useChatHistory } from '../ConversationHistory/useChatHistory';
import { useUsage } from '../Usage/useUsage';
import { useSettings } from '../Settings/useSettings';
import { UsageLog } from '@/common/usage';
import { ChatMessage, ConversationType, MessagesOrderMap } from '@/common/conversation';
import { useTasks } from '../Tasks/useTasks';
import { sleep } from '@/libs/sleep';
import { ConversationIdea, useAiUserInfo } from '../Ai/useAiUserInfo';
import { GuessGameStat, RecordingUserMessageMode } from './types';
import { useAuth } from '../Auth/useAuth';
import { firstAiMessage } from '@/features/Lang/lang';
import { GoalElementInfo } from '../Plan/types';
import { usePlan } from '../Plan/usePlan';
import * as Sentry from '@sentry/nextjs';
import { ConversationMode } from '@/common/user';
import { useAccess } from '../Usage/useAccess';
import { LessonPlan, LessonPlanAnalysis, LessonPlanStep } from '../LessonPlan/type';
import { ConversationConfig, ConversationInstance } from './ConversationInstance/types';
import { useTextAi } from '../Ai/useTextAi';
import { initTextConversation } from './ConversationInstance/textConversation';
import { useConversationAudio } from '../Audio/useConversationAudio';
import { getAiVoiceByVoice } from './CallMode/voiceAvatar';

const getVoiceInstructions = (voice: AiVoice): string => {
  const voiceAvatar = getAiVoiceByVoice(voice);
  const voiceInstructions = `## AI Voice
${voiceAvatar.voiceInstruction}`;
  return voiceInstructions;
};

const getConversationStarterMessagePrompt = (startMessage: string): string => {
  if (!startMessage) {
    return '';
  }
  return `## Conversation Start
Start the conversation with message like this: ${startMessage}.`;
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

  voice: AiVoice;

  messageOrder: MessagesOrderMap;

  setWebCamDescription: (description: string) => void;
  closeConversation: () => Promise<void>;
  toggleConversationMode: (mode: ConversationMode) => void;
  conversationMode: ConversationMode;

  lessonPlanAnalysis: LessonPlanAnalysis | null;
  setLessonPlanAnalysis: (analysis: LessonPlanAnalysis | null) => void;
  recordingVoiceMode: RecordingUserMessageMode;

  completeUserMessageDelta: (params: { triggerResponse?: boolean }) => Promise<void>;
  addUserMessageDelta: (delta: string) => void;
}

const AiConversationContext = createContext<AiConversationContextType | null>(null);

const modesToExtractUserInfo: ConversationType[] = ['talk', 'goal-talk'];

function useProvideAiConversation(): AiConversationContextType {
  const [isInitializing, setIsInitializing] = useState('');
  const history = useChatHistory();
  const auth = useAuth();
  const settings = useSettings();
  const aiUserInfo = useAiUserInfo();
  const ai = useTextAi();
  const firstPotentialBotMessage = useRef('');
  const userInfo = aiUserInfo.userInfo?.records?.join('. ') || '';
  const fullLanguageName = settings.fullLanguageName || 'English';
  const languageCode = settings.languageCode || 'en';
  const [isVolumeOn, setIsVolumeOn] = useState(true);
  const [voice, setVoice] = useState<AiVoice | null>(null);
  const [lessonPlanAnalysis, setLessonPlanAnalysis] = useState<LessonPlanAnalysis | null>(null);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);

  const [recordingVoiceMode, setRecordingVoiceMode] =
    useState<RecordingUserMessageMode>('PushToTalk');

  const updateLessonPlanAnalysis = async (analysis: LessonPlanAnalysis | null) => {
    setLessonPlanAnalysis(analysis);

    if (analysis?.teacherResponse) {
      communicatorRef.current?.sendCorrectionInstruction(analysis.teacherResponse);
      // await sleep(30);
      //await communicatorRef.current?.triggerAiResponse();
      //setIsWaitingForCorrection(false);
    } else {
      await communicatorRef.current?.triggerAiResponse();
      //const correctionInstruction = getCorrectionInstruction(correction);
      //communicatorRef.current?.sendCorrectionInstruction(correctionInstruction);
    }
  };

  const completeUserMessageDelta = async ({ triggerResponse }: { triggerResponse?: boolean }) => {
    communicatorRef.current?.completeUserMessageDelta();
    if (triggerResponse) {
      await sleep(300);
      communicatorRef.current?.triggerAiResponse();
    }
  };

  const addUserMessageDelta = (delta: string) => {
    communicatorRef.current?.addUserMessageDelta(delta);
  };

  const aiModal = MODELS.REALTIME_CONVERSATION;

  const toggleVolume = (isOn: boolean) => {
    setIsVolumeOn(isOn);
    communicatorRef.current?.toggleVolume(isOn);
    audio.setVolume(isOn ? 1 : 0);
    if (!isOn && audio.isPlaying) {
      audio.interrupt();
    }
  };

  const getWebCamDescriptionInstruction = (description: string): string => {
    if (!description || description.trim().length === 0) {
      return '';
    }
    const message = `
VISUAL_CONTEXT is sensor data from the user's webcam. You can use it during the conversation to better understand user's emotions and reactions.
VISUAL_CONTEXT (latest): ${description}
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

  const [messageOrder, setMessageOrder] = useState<MessagesOrderMap>({});

  const appMode = settings.appMode;

  const aiPersona =
    appMode === 'learning'
      ? `You are an ${fullLanguageName} teacher.`
      : `You are an job interview coach.`;

  const [communicator, setCommunicator] = useState<ConversationInstance>();
  const communicatorRef = useRef(communicator);
  communicatorRef.current = communicator;

  const planMessageCount = 40;

  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (!conversationId || conversation.length === 0) return;

    if (conversation.length === 2) {
      if (currentMode === 'words') {
        tasks.completeTask('words');
      } else if (currentMode === 'rule') {
        tasks.completeTask('rule');
      } else {
        tasks.completeTask('lesson');
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

  useEffect(() => {
    if (!conversationId || conversation.length === 0) return;
    history.setMessages(conversationId, conversation);
  }, [conversation]);

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

  const onOpen = async () => {
    //await sleep(100);
    communicatorRef.current?.triggerAiResponse();
    await sleep(1000);
    setIsInitializing('');
    setIsStarted(true);
  };

  const toggleConversationMode = (mode: ConversationMode) => {
    const isLimited = !access.isFullAppAccess;
    settings.setConversationMode(mode);

    if (mode === 'call') {
      toggleMute(isLimited ? true : false);
    }

    if (mode === 'chat') {
      toggleMute(true);
    }

    if (mode === 'record') {
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
      const isEmptyNewMessage = message.text.trim() === '';
      const isErrorState = isEmptyChat && isEmptyNewMessage;
      if (isErrorState) {
        console.error('❌ Empty message from AI. Restarting conversation...');
        console.log('message', message);
        Sentry.captureException(new Error('Empty message from AI. Restarting conversation...'), {
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
              ? firstPotentialBotMessage.current || '...'
              : message.text,
        },
      ];
    });
  };

  const access = useAccess();
  const isLowBalance = !access.isFullAppAccess;

  const [isVolumeOffDueToNoBalance, setIsVolumeOffDueToNoBalance] = useState(false);
  useEffect(() => {
    const isRestoredBalance = isVolumeOffDueToNoBalance && !isLowBalance;
    if (isRestoredBalance) {
      communicatorRef.current?.toggleVolume(true);
      communicatorRef.current?.unlockVolume();
      setIsVolumeOffDueToNoBalance(false);
    }

    if (!isLowBalance) {
      return;
    }
    communicatorRef.current?.toggleVolume(false);
    communicatorRef.current?.lockVolume();
    setIsVolumeOffDueToNoBalance(true);
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
  const audio = useConversationAudio();
  const [isAiSpeakingStartedFromConversation, setIsAiSpeakingStartedFromConversation] =
    useState(false);
  const isSpeakingFromConversation = isAiSpeakingStartedFromConversation && audio.isPlaying;

  const getBaseRtcConfig = async () => {
    const baseConfig: ConversationConfig = {
      model: aiModal,
      initInstruction: '',
      onOpen,
      onMessage,
      onAddDelta,
      setIsAiSpeaking,
      setIsUserSpeaking,
      isMuted,
      isVolumeOn,
      onAddUsage: (usageLog: UsageLog) => usage.setUsageLogs((prev) => [...prev, usageLog]),
      languageCode: settings.languageCode || 'en',
      getAuthToken: async () => await auth.getToken(),
      onMessageOrder: updateMessageOrder,
      generateTextWithAi: async ({ userMessage, systemMessage }) => {
        return await ai.generate({
          userMessage,
          systemMessage,
          languageCode: settings.languageCode || 'en',
          model: 'gpt-4o',
        });
      },
      playAudio: async (textToPlay: string, voice: AiVoice, instruction: string) => {
        await audio.interruptWithFade(120);
        setIsAiSpeakingStartedFromConversation(true);
        await audio.speak(textToPlay, { instructions: instruction, voice });
        setIsAiSpeakingStartedFromConversation(false);
      },
    };
    return baseConfig;
  };

  const getConversationConfig = async ({
    mode,
    goal,
    ideas,
    lessonPlan,
    voice,
  }: {
    mode: ConversationType;
    goal?: GoalElementInfo | null;
    ideas?: ConversationIdea;
    lessonPlan?: LessonPlan;
    voice: AiVoice;
  }): Promise<ConversationConfig> => {
    const baseConfig = await getBaseRtcConfig();

    const voiceInstructions = getVoiceInstructions(voice);

    let lessonPlanPrompt = lessonPlan
      ? `## Lesson Plan:
${lessonPlan.steps
  .map(
    (step: LessonPlanStep, index: number) =>
      `${index + 1}. ${step.stepTitle}\n${step.teacherInstructions}`,
  )
  .join('\n')}
`
      : '';

    const goalTitle = goal?.goalPlan.title || '';
    const elementTitle = goal?.goalElement.title || '';
    const elementDescription = goal?.goalElement.description || '';
    const goalInfo = `${goalTitle} - ${elementTitle} - ${elementDescription}`;
    const elementDetails = goal?.goalElement.details || '';

    let userInfoPrompt = userInfo ? `## Info about Student:\n${userInfo}.` : '';

    // GOAL TALK, conversation
    if (mode === 'goal-talk') {
      if (!goal) {
        throw new Error('Goal is not set for goal-talk mode');
      }
      setIsInitializing(`Analyzing Goal Lesson...`);
      const firstMessage =
        ideas?.firstMessage || (await aiUserInfo.generateFirstMessageText(goalInfo)).firstMessage;
      firstPotentialBotMessage.current = firstMessage;
      let startFirstMessage = `"${firstMessage}".`;

      let userInfoPrompt = userInfo ? `## Info about Student:\n${userInfo}.` : '';

      setIsInitializing(`Starting conversation...`);

      return {
        ...baseConfig,
        model: aiModal,
        voice,
        initInstruction: `# Overview
You are an ${fullLanguageName} speaking teacher. Your name is "${voice}".
Your role is to make user talks on a topic: ${elementTitle}. ${elementDescription}. (${elementDetails}).
You win the goal if user will talk with you. Keep in mind to change topic if user stuck at some point

${teacherRules}

${lessonPlanPrompt || getConversationStarterMessagePrompt(startFirstMessage)}

${userInfoPrompt}

${voiceInstructions}`,
      };
    }
    // GOAL ROLE PLAY
    if (mode === 'goal-role-play') {
      if (!goal) {
        throw new Error('Goal is not set for goal-talk mode');
      }
      setIsInitializing(`Starting Role Play...`);
      return {
        ...baseConfig,
        model: aiModal,
        voice,
        initInstruction: `# Overview
You are an ${fullLanguageName} speaking teacher. Your name is "${voice}".
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

    if (mode === 'talk') {
      let startFirstMessage = `"${firstAiMessage[languageCode]}"`;

      let openerInfoPrompt = 'Ask the student to describe their day.';

      if (userInfo && userInfo.length > 0) {
        setIsInitializing(`Analyzing info...`);
        const first = ideas || (await aiUserInfo.generateFirstMessageText(''));
        const { firstMessage, potentialTopics } = first;

        firstPotentialBotMessage.current = firstMessage;
        startFirstMessage = `"${firstMessage}".`;

        openerInfoPrompt = `Info about Student : ${userInfo}. 

Ask the student to describe their day and try to cover new topics that used didn't mentioned before.
Don't focus solely on one topic. Try to cover a variety of topics (Example\n${potentialTopics}).
  `;
        setIsInitializing(`Starting conversation...`);
      }

      return {
        ...baseConfig,
        model: aiModal,
        voice,
        initInstruction: `${aiPersona} Your name is ${voice}. Your role is to make user talks.
${openerInfoPrompt}
Do not teach or explain rules—just talk.
You should be friendly and engaging.
Don't make user feel like they are being tested and feel stupid. Ask only one question at a time or even without questions.
If you feel that the user is struggling, you can propose a new topic.
Engage in a natural conversation without making it feel like a lesson.

${
  userInfo
    ? ''
    : 'After the first user response, introduce yourself, your role and ask user to describe their day.'
}

${voiceInstructions}

${getConversationStarterMessagePrompt(startFirstMessage)}

During conversation ask only one question at a time or even without questions.
    `,
      };
    }

    // SCENARIOS. OLD FEATURE
    if (mode === 'role-play') {
      return {
        ...baseConfig,
        voice,
        model: aiModal,
        initInstruction: ``,
      };
    }

    if (mode === 'rule') {
      let userInfoPrompt = userInfo ? `## Info about Student:\n${userInfo}.` : '';
      return {
        ...baseConfig,
        voice,
        model: aiModal,
        initInstruction: `${aiPersona}
The user wants to learn a new rule.
Start your lesson be introducing the rule with short explanation.
Then, ask user to use these rules in sentences.
Craft a lesson that will help user to understand the rule.

${userInfoPrompt}

${voiceInstructions}
`,
      };
    }

    if (mode === 'words') {
      let userInfoPrompt = userInfo ? `## Info about Student:\n${userInfo}.` : '';
      return {
        ...baseConfig,
        model: aiModal,
        voice,
        initInstruction: `${aiPersona}
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

  const [currentMode, setCurrentMode] = useState<ConversationType>('talk');

  const startConversation = async (input: StartConversationProps) => {
    if (!settings.languageCode) throw new Error('Language is not set | startConversation');
    setMessageOrder({});

    setLessonPlan(input.lessonPlan || null);

    let isMutedInternal = isMuted;
    const isRecordingNeedMute = !isMuted && input.conversationMode === 'record';
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

    console.log('START', {
      isVolumeOnInternal,
      isMutedInternal,
      mode: input.mode,
    });

    if (input.analyzeResultAiInstruction) {
      console.log('analyzeResultAiInstruction', input.analyzeResultAiInstruction);
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
      setErrorInitiating('');

      firstPotentialBotMessage.current = '';
      const conversationConfig = await getConversationConfig({
        mode: input.mode,
        goal: input.goal,
        ideas: input.ideas,
        lessonPlan: input.lessonPlan,
        voice: input.voice || 'shimmer',
      });
      let instruction = conversationConfig.initInstruction;

      if (input.wordsToLearn?.length) {
        instruction += `
## Words to learn:
${input.wordsToLearn.join(' ')}
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
Words you need to describe: ${input.gameWords.wordsAiToDescribe.join(', ')}
`;
      }

      const premiumUsers = [
        'K1S4bliZw4hYbpftEC6sG5s9WYj2',
        'WpDWCIdffeTOWyndAMpUOn3PUuY2',
        '5LRw3ARnx1NL2navOPjIqEzdWip1', //Daniel
        //'Mq2HfU3KrXTjNyOpPXqHSPg5izV2', //- My
        '6x9zLTu7svdkHqm9huJ8Sx2On1T2', // My safari
      ];
      //const userIdsToSkipVad = ['Mq2HfU3KrXTjNyOpPXqHSPg5izV2'];

      const modesToUseRrc: ConversationType[] = ['talk', 'role-play'];
      const isPremiumUser = premiumUsers.includes(auth.uid || '');

      // Talk Mode and only for premium users
      const isUseRealtime = modesToUseRrc.includes(input.mode) && isPremiumUser;

      // any other users
      const isUseVad = !isUseRealtime;

      const newRecordingMode: RecordingUserMessageMode = isUseRealtime
        ? 'RealTimeConversation'
        : isUseVad
          ? 'VAD'
          : 'PushToTalk';
      console.log('newRecordingMode', newRecordingMode);
      setRecordingVoiceMode(newRecordingMode);

      const initConversation = isUseRealtime ? initWebRtcConversation : initTextConversation;

      const conversation = await initConversation({
        ...conversationConfig,
        initInstruction: instruction,
        voice: conversationConfig.voice || input.voice,
        isMuted: isMutedInternal,
        isVolumeOn: isVolumeOnInternal,
        webCamDescription: input.webCamDescription || '',
      });
      setVoice(conversationConfig.voice || input.voice || null);
      history.createConversation({
        conversationId,
        languageCode: settings.languageCode,
        mode: input.mode,
      });
      setCommunicator(conversation);
    } catch (e) {
      console.error(e);
      const isNotAllowedError = (e as Error).toString().includes('NotAllowedError');
      console.log('isNotAllowedError', isNotAllowedError);
      setErrorInitiating(
        isNotAllowedError
          ? 'Please enable microphone access to start the conversation. Error code:' + `${e}`
          : 'Please check you microphone access and try to refresh page. Error code:' + `${e}`,
      );
      setIsInitializing('');
      throw e;
    }
  };

  const closeConversation = async () => {
    await audio.interruptWithFade(120);
    setIsClosing(true);
    setIsStarted(false);
    setIsInitializing('');
    communicator?.closeHandler();
    setLessonPlanAnalysis(null);

    try {
      const isNeedToSaveUserInfo = modesToExtractUserInfo.includes(currentMode);
      if (isNeedToSaveUserInfo && conversation.length > 4) {
        await aiUserInfo.updateUserInfo(conversation);
      }
    } catch (e) {
      console.error('Error saving user info:', e);
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
    if (!lessonPlan) {
      await sleep(100);
      await communicatorRef.current?.triggerAiResponse();
    }
  };

  return {
    currentMode,
    voice: voice || 'shimmer',
    conversationId,
    isInitializing,
    isStarted,
    startConversation,
    conversation,
    errorInitiating,
    isClosing,
    isAiSpeaking: isSpeakingFromConversation || isAiSpeaking,
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

    recordingVoiceMode,

    completeUserMessageDelta,
    addUserMessageDelta,
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
    throw new Error('useAiConversation must be used within an AiConversationProvider');
  }
  return context;
}
