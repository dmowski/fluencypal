'use client';

import { createContext, useContext, ReactNode, JSX, useEffect, useRef, useState } from 'react';
import { AiVoice, MODELS, pricePerHourUsd, RealTimeModel } from '@/features/Ai/ai';
import {
  ADVANCED_PRICE_PER_HOUR_USD,
  isAdvancedRealtimeModel,
} from '@/features/Usage/advancedUsage';
import { initWebRtcConversation } from '../ConversationInstance/webRtc';
import { initRealtimeWsConversation } from '../ConversationInstance/realtimeWs/initRealtimeWsConversation';
import { RealtimeWsAuthError } from '../ConversationInstance/realtimeWs/resolveRealtimeWsAuthToken';
import { useSettings } from '../../Settings/useSettings';
import { ConversationType } from '@/features/Conversation/conversation';
import { sleep } from '@/libs/sleep';
import { ConversationIdea, useAiUserInfo } from '../../User/useAiUserInfo';
import { GuessGameStat, RecordingUserMessageMode } from '../types';
import { useAuth } from '../../Auth/useAuth';
import { firstAiMessage, fullEnglishLanguageName, getPageLangCode } from '@/features/Lang/lang';
import { GoalElementInfo } from '../../Plan/types';
import { ConversationMode } from '@/features/Settings/userSettings';
import { useAccess } from '../../Usage/useAccess';
import { LessonPlan, LessonPlanStep } from '../../LessonPlan/type';
import { ConversationConfig, ConversationInstance } from '../ConversationInstance/types';
import { useTextAi } from '../../Ai/useTextAi';
import { useConversationAudio } from '../../Audio/useConversationAudio';
import { AiConversationContextType, StartConversationProps } from './types';
import { getVoiceInstructions } from './getVoiceInstructions';
import { teacherRules } from './teacherRules';
import { getConversationStarterMessagePrompt } from './getConversationStarterMessagePrompt';
import { getQuizTalkInstruction } from './getQuizTalkInstruction';
import { getWebCamDescriptionInstruction } from './getWebCamDescriptionInstruction';
import { useAiConversationMessages } from './useAiConversationMessages';
import { resolvePracticeLanguage } from '@/features/Goal/Quiz/resolvePracticeLanguage';
import { useConversationStat } from './useConversationStat';
import { useLimits } from './useLimits';
import { useConversationUsage } from './useConversationUsage';
import { useAliasConversationAnalytics } from './useAliasConversationAnalytics';
import { closeAudioMediaStream, closeVideoMediaStream } from '@/features/webCam/mediaStream';
import { writePreferredMicrophoneId } from '@/libs/mic';
import { getVoiceOverSpeakOptions } from '@/features/Audio/getVoiceOverSpeakOptions';
import { getVoiceSpeedInstruction } from '../CallMode/voiceSpeed';
import { sendCallState, sendUiError } from '@/features/Analytics/Custom/sendOutcomeEvents';

const AiConversationContext = createContext<AiConversationContextType | null>(null);

function useProvideAiConversation(): AiConversationContextType {
  const [isInitializing, setIsInitializing] = useState('');
  const auth = useAuth();
  const settings = useSettings();
  const aiUserInfo = useAiUserInfo();
  const ai = useTextAi();
  const firstPotentialBotMessage = useRef('');
  const userInfo = aiUserInfo.advancedUserRecords;

  const fullLanguageName = settings.fullLanguageName || 'English';
  const languageCode = settings.languageCode || 'en';
  const [isVolumeOn, setIsVolumeOn] = useState(true);
  const [voice, setVoice] = useState<AiVoice | null>(null);
  const [currentMode, setCurrentMode] = useState<ConversationType>('talk');
  const voiceSpeed = settings.aiVoiceSpeed;
  const [gameStat, setGameStat] = useState<GuessGameStat | null>(null);
  const [activeRolePlayId, setActiveRolePlayId] = useState<string | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [goalInfo, setGoalInfo] = useState<GoalElementInfo | null>(null);
  const [errorInitiating, setErrorInitiating] = useState<string>();
  const [isClosing, setIsClosing] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const messages = useAiConversationMessages();
  const [recordingVoiceMode, setRecordingVoiceMode] =
    useState<RecordingUserMessageMode>('RealTimeConversation');

  const communicatorRef = useRef<ConversationInstance | undefined>(undefined);
  const experimentalRealtimeWsActiveRef = useRef(false);

  const [isMuted, setIsMuted] = useState(true);
  const [activeRealtimeModel, setActiveRealtimeModel] = useState<RealTimeModel | null>(null);
  const access = useAccess();
  const audio = useConversationAudio();
  const [isAiSpeakingStartedFromConversation, setIsAiSpeakingStartedFromConversation] =
    useState(false);
  const isSpeakingFromConversation = isAiSpeakingStartedFromConversation && audio.isPlaying;
  const appMode = settings.appMode;
  const aiPersona =
    appMode === 'learning'
      ? `You are an ${fullLanguageName} teacher.`
      : `You are an job interview coach.`;

  const completeUserMessageDelta = async ({
    triggerResponse,
    removeMessage,
  }: {
    triggerResponse?: boolean;
    removeMessage?: boolean;
  }) => {
    communicatorRef.current?.completeUserMessageDelta({
      removeMessage,
    });
    if (triggerResponse && !removeMessage) {
      await sleep(300);
      communicatorRef.current?.triggerAiResponse();
    }
  };

  const addUserMessageDelta = (delta: string) => {
    communicatorRef.current?.addUserMessageDelta(delta);
  };

  const toggleVolume = (isOn: boolean) => {
    setIsVolumeOn(isOn);
    communicatorRef.current?.toggleVolume(isOn);
    audio.setVolume(isOn ? 1 : 0);
    if (!isOn && audio.isPlaying) {
      audio.interrupt();
    }
  };

  const setWebCamDescription = async (webCamDescription: string) => {
    const instruction = getWebCamDescriptionInstruction(webCamDescription);
    if (instruction) communicatorRef.current?.sendWebCamDescription(instruction);
  };

  useConversationStat(
    messages.conversationId || '',
    messages.conversation,
    messages.messageOrder,
    currentMode,
    goalInfo,
  );

  const toggleMute = (isMute: boolean) => {
    communicatorRef.current?.toggleMute(isMute);
    setIsMuted(isMute);
  };

  const switchMicrophone = async (deviceId: string | null) => {
    writePreferredMicrophoneId(deviceId);
    await communicatorRef.current?.switchMicrophone(deviceId);
  };

  const limits = useLimits(
    communicatorRef,
    messages.conversation,
    toggleMute,
    toggleVolume,
    isAdvancedRealtimeModel(activeRealtimeModel),
  );

  const { resetAliasAnalytics } = useAliasConversationAnalytics({
    activeRolePlayId,
    gameStat,
    conversation: messages.conversation,
    isClosing,
  });

  const conversationUsage = useConversationUsage(messages.conversation.length);

  useEffect(() => {
    return () => communicatorRef.current?.closeHandler();
  }, []);

  const onOpen = async () => {
    const isExperimentalWs = experimentalRealtimeWsActiveRef.current;

    if (!isExperimentalWs) {
      await sleep(300);
      console.log('Sleep before triggering');
      setIsInitializing('');
      setIsStarted(true);
      await sleep(1000);
      await sleep(600);
      await communicatorRef.current?.triggerAiResponse();
      return;
    }

    setIsInitializing('');
    setIsStarted(true);
  };

  const toggleConversationMode = (mode: ConversationMode) => {
    const isLimited = !access.isFullAppAccess;
    settings.setConversationMode(mode);
    toggleMute(true);
    toggleVolume(isLimited ? false : true);
  };

  const getBaseRtcConfig = (activeLanguageCode: typeof languageCode) => {
    const baseConfig: ConversationConfig = {
      model: MODELS.REALTIME_CONVERSATION,
      initInstruction: '',
      onOpen,
      onMessage: (message) =>
        messages.onMessage(message, { firstPotentialBotMessage: firstPotentialBotMessage.current }),
      onAddDelta: messages.onAddDelta,
      setIsAiSpeaking,
      setIsUserSpeaking,
      isMuted,
      isVolumeOn,
      onAddUsage: conversationUsage.onAddUsage,
      languageCode: activeLanguageCode,
      getAuthToken: () => auth.getToken(),
      onMessageOrder: messages.updateMessageOrder,
      generateTextWithAi: async ({ userMessage, systemMessage }) => {
        return await ai.generate({
          userMessage,
          systemMessage,
          languageCode: activeLanguageCode,
          model: 'gpt-5.6-luna',
        });
      },
      playAudio: async (textToPlay: string, voice: AiVoice) => {
        await audio.interruptWithFade(120);
        setIsAiSpeakingStartedFromConversation(true);
        console.log('Start speaking', textToPlay);

        const speedInstruction = getVoiceSpeedInstruction(voiceSpeed);
        const languageInstruction = getVoiceOverSpeakOptions(activeLanguageCode).instructions;
        const finalInstruction = `${languageInstruction} ${speedInstruction}`;
        await audio.speak(textToPlay, { instructions: finalInstruction, voice });
        setIsAiSpeakingStartedFromConversation(false);
      },
      conversationId: messages.conversationId || '',
      userPricePerHourUsd: pricePerHourUsd,
    };
    return baseConfig;
  };

  const getConversationConfig = async ({
    mode,
    goal,
    ideas,
    lessonPlan,
    voice,
    isNewUser,
    activeLanguageCode,
    aboutUserTranscription,
  }: {
    mode: ConversationType;
    goal?: GoalElementInfo | null;
    ideas?: ConversationIdea;
    lessonPlan?: LessonPlan;
    voice: AiVoice;
    isNewUser: boolean;
    activeLanguageCode: typeof languageCode;
    aboutUserTranscription?: string;
  }): Promise<ConversationConfig> => {
    const baseConfig = getBaseRtcConfig(activeLanguageCode);
    const activeFullLanguageName = fullEnglishLanguageName[activeLanguageCode] || fullLanguageName;

    const voiceInstructions = getVoiceInstructions(voice, voiceSpeed);

    const lessonPlanPrompt = lessonPlan
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

    const userInfoPrompt = userInfo ? `## Info about Student:\n${userInfo}.` : '';

    // GOAL TALK, conversation
    if (mode === 'goal-talk') {
      if (!goal) throw new Error('Goal is not set for goal-talk mode');

      setIsInitializing(`Analyzing Goal Lesson...`);
      const firstMessage =
        ideas?.firstMessage || (await aiUserInfo.generateFirstMessageText(goalInfo)).firstMessage;
      firstPotentialBotMessage.current = firstMessage;
      const startFirstMessage = `"${firstMessage}".`;

      setIsInitializing(`Starting conversation...`);

      return {
        ...baseConfig,
        voice,
        initInstruction: `# Overview
You are an ${activeFullLanguageName} speaking teacher. Your name is "${voice}".
Your role is to make user talks on a topic: ${elementTitle}. ${elementDescription}. (${elementDetails}).
You win the goal if user will talk with you. Keep in mind to change topic if user stuck at some point
        
${teacherRules}

${lessonPlanPrompt || getConversationStarterMessagePrompt(startFirstMessage)}

${userInfoPrompt}

${voiceInstructions}

Use ${activeFullLanguageName} language in conversation.

Start the first message slowly and simply.
`,
      };
    }
    // GOAL ROLE PLAY
    if (mode === 'goal-role-play') {
      if (!goal) throw new Error('Goal is not set for goal-role-play mode');

      setIsInitializing(`Starting Role Play...`);
      return {
        ...baseConfig,
        voice,
        initInstruction: `# Overview
You are an ${activeFullLanguageName} speaking teacher. Your name is "${voice}".
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

    if (mode === 'quiz-talk') {
      return {
        ...baseConfig,
        voice,
        initInstruction: getQuizTalkInstruction({
          languageName: activeFullLanguageName,
          voice,
          aboutUserTranscription: aboutUserTranscription || '',
          voiceInstructions,
        }),
      };
    }

    if (mode === 'talk') {
      // todo: Adjust to more creative
      let startFirstMessage = `"${firstAiMessage[activeLanguageCode]}"`;

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
Use ${activeFullLanguageName} language in conversation.
  `;

        setIsInitializing(`Starting conversation...`);
        console.log('Starting');
      }

      return {
        ...baseConfig,
        voice,
        initInstruction: `${
          appMode === 'learning'
            ? `You are an ${activeFullLanguageName} teacher.`
            : `You are an job interview coach.`
        } Your name is ${voice}. Your role is to make user talks.
${openerInfoPrompt}
Do not teach or explain rules—just talk.
You should be friendly and engaging.
Don't make user feel like they are being tested and feel stupid. Ask only one question at a time or even without questions.
If you feel that the user is struggling, you can propose a new topic.
Engage in a natural conversation without making it feel like a lesson.
Stay in character as ${voice}. Do not introduce yourself as a different teacher.
If the student asks whether you can hear them, answer that directly once, then wait.
If they say they cannot hear you, tell them to raise device volume; do not assume their microphone is broken or keep asking about their day.
If they ask for a different teacher or a male/female voice, acknowledge the request and keep talking as ${voice}.

${isNewUser ? 'Introduce yourself, and ask user to describe their day.' : ''}

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
        initInstruction: ``,
      };
    }

    if (mode === 'rule') {
      const userInfoPrompt = userInfo ? `## Info about Student:\n${userInfo}.` : '';
      return {
        ...baseConfig,
        voice,

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
      const userInfoPrompt = userInfo ? `## Info about Student:\n${userInfo}.` : '';
      return {
        ...baseConfig,

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

    if (mode === 'grammar-improvement') {
      const userInfoPrompt = userInfo ? `## Info about Student:\n${userInfo}.` : '';
      return {
        ...baseConfig,

        voice,
        initInstruction: `${aiPersona}

${userInfoPrompt}

${voiceInstructions}

`,
      };
    }

    if (mode === 'news-discussion') {
      const userInfoPrompt = userInfo ? `## Info about Student:\n${userInfo}.` : '';
      return {
        ...baseConfig,

        voice,
        initInstruction: `${aiPersona}

The user just read a news article. Discuss it with them. Ask focused
questions to push the user to speak more. Do not re-explain the facts.

${userInfoPrompt}

${voiceInstructions}

`,
      };
    }

    throw new Error(`Unknown mode: ${mode}`);
  };

  const settingsVoice = settings.userSettings?.teacherVoice;
  const startConversation = async (input: StartConversationProps) => {
    const activeLanguageCode = resolvePracticeLanguage({
      explicitLanguage: input.languageCode,
      settingsLanguage: settings.languageCode,
      pendingLanguage: null,
      pageLanguage: getPageLangCode(),
    });
    if (
      !settings.languageCode ||
      (input.languageCode && settings.languageCode !== input.languageCode)
    ) {
      await settings.setLanguage(activeLanguageCode);
    }

    const newConversationId = messages.newConversation(
      input.mode,
      input.rolePlayId || null,
      activeLanguageCode,
    );
    messages.resetMessageOrder();

    let isMutedInternal = true;
    const startUnmuted = Boolean(input.startUnmuted) && input.conversationMode === 'call';
    const isRecordingNeedMute = !isMuted && input.conversationMode === 'record';

    if (isRecordingNeedMute) {
      toggleMute(true);
      isMutedInternal = true;
    } else if (startUnmuted) {
      toggleMute(false);
      isMutedInternal = false;
    }

    toggleVolume(true);

    const isVolumeOnInternal = true;

    console.log('START', {
      isVolumeOnInternal,
      isMutedInternal,
      mode: input.mode,
    });

    if (input.analyzeResultAiInstruction) {
      console.log('analyzeResultAiInstruction', input.analyzeResultAiInstruction);
    }

    setGameStat(input.gameWords ? input.gameWords : null);
    setActiveRolePlayId(input.rolePlayId || null);
    resetAliasAnalytics();
    setGoalInfo(input.goal || null);

    try {
      setIsStarted(true);
      setIsInitializing(`Calling...`);
      sendCallState({ state: 'connecting', conversationId: newConversationId });
      setCurrentMode(input.mode);
      messages.setConversation([]);
      setIsClosing(false);
      setIsClosed(false);
      setErrorInitiating('');

      firstPotentialBotMessage.current = '';
      const isNewUser = await messages.resolveIsNewUser();
      const conversationConfig = await getConversationConfig({
        mode: input.mode,
        goal: input.goal,
        ideas: input.ideas,
        lessonPlan: input.lessonPlan,
        voice: input.voice || settingsVoice || 'shimmer',
        isNewUser,
        activeLanguageCode,
        aboutUserTranscription: input.aboutUserTranscription,
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

      const newRecordingMode: RecordingUserMessageMode = 'RealTimeConversation';
      console.log('newRecordingMode', newRecordingMode);
      setRecordingVoiceMode(newRecordingMode);

      experimentalRealtimeWsActiveRef.current = Boolean(input.experimentalRealtimeWs);

      const initConversation = input.experimentalRealtimeWs
        ? initRealtimeWsConversation
        : initWebRtcConversation;

      const model = input.model || MODELS.REALTIME_CONVERSATION;
      setActiveRealtimeModel(model);

      // audio.music.stop();

      const conversation = await initConversation({
        ...conversationConfig,
        model: model,
        userPricePerHourUsd: isAdvancedRealtimeModel(model)
          ? ADVANCED_PRICE_PER_HOUR_USD
          : pricePerHourUsd,
        initInstruction: instruction,
        voice: conversationConfig.voice || input.voice || settingsVoice || 'shimmer',
        isMuted: isMutedInternal,
        isVolumeOn: isVolumeOnInternal,
        webCamDescription: input.webCamDescription || '',
        conversationId: newConversationId,
        ...(input.experimentalRealtimeWs
          ? {
              onTransportError: (message: string) => {
                setErrorInitiating(message);
                setIsInitializing('');
                setIsStarted(false);
                communicatorRef.current?.closeHandler();
                communicatorRef.current = undefined;
                sendCallState({
                  state: 'failed',
                  conversationId: newConversationId,
                  reason: 'transport',
                });
                sendUiError('call_transport_failed');
              },
            }
          : {}),
      });
      setVoice(conversationConfig.voice || input.voice || settingsVoice || 'shimmer');

      communicatorRef.current = conversation;
      conversation.flushSessionReady?.();
      sendCallState({ state: 'connected', conversationId: newConversationId });
    } catch (e) {
      console.error(e);
      setActiveRealtimeModel(null);
      experimentalRealtimeWsActiveRef.current = false;
      if (e instanceof RealtimeWsAuthError) {
        setErrorInitiating(e.message);
        setIsInitializing('');
        setIsStarted(false);
        throw e;
      }
      const isNotAllowedError = (e as Error).toString().includes('NotAllowedError');
      console.log('isNotAllowedError', isNotAllowedError);
      sendCallState({
        state: 'failed',
        conversationId: newConversationId,
        reason: isNotAllowedError ? 'mic' : 'init',
      });
      sendUiError(isNotAllowedError ? 'mic_denied' : 'call_init_failed');
      setErrorInitiating(
        isNotAllowedError
          ? 'Please enable microphone access to start the conversation. Error code:' + `${e}`
          : 'Please check you microphone access and try to refresh page. Error code:' + `${e}`,
      );
      setIsInitializing('');
      setIsStarted(false);
      throw e;
    }
  };

  const closeConversation = async () => {
    const userMessageCount = messages.conversation.filter(
      (message) => !message.isBot && Boolean(message.text?.trim()),
    ).length;
    sendCallState({
      state: 'ended',
      conversationId: messages.conversationId,
      userMessageCount,
    });
    await audio.interruptWithFade(120);
    setIsClosing(true);
    setIsStarted(false);
    setIsInitializing('');
    experimentalRealtimeWsActiveRef.current = false;
    communicatorRef.current?.closeHandler();

    messages.setConversationId(null);
    messages.setConversation([]);
    setActiveRealtimeModel(null);
    audio.setVolume(1);

    closeVideoMediaStream();
    closeAudioMediaStream();
  };

  const addUserMessage = async (message: string) => {
    communicatorRef.current?.addThreadsMessage(message);
    await sleep(100);
    try {
      await communicatorRef.current?.triggerAiResponse();
    } catch (error) {
      console.warn('triggerAiResponse after user message failed', error);
    }
  };
  const addUserMessageRef = useRef(addUserMessage);
  addUserMessageRef.current = addUserMessage;

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_IS_FIREBASE_EMULATOR !== 'true') {
      return;
    }
    const testHandle = (window as unknown as { __darkEngTest?: Record<string, unknown> })
      .__darkEngTest;
    if (!testHandle) {
      return;
    }
    testHandle.addConversationUserMessage = (message: string) => addUserMessageRef.current(message);
    testHandle.isConversationStarted = () => isStarted;
    return () => {
      delete testHandle.addConversationUserMessage;
      delete testHandle.isConversationStarted;
    };
  }, [isStarted]);

  return {
    isLimitedAiVoice: limits.isLimitedAiVoice,
    isLimitedRecording: limits.isLimitedRecording,
    isGuestConversationLimited: limits.isGuestConversationLimited,
    currentMode,
    voice: voice || 'shimmer',
    conversationId: messages.conversationId,
    isInitializing,
    isStarted,
    startConversation,
    conversation: messages.conversation,
    errorInitiating,
    isClosing,
    isAiSpeaking: isSpeakingFromConversation || isAiSpeaking,
    isClosed,
    isUserSpeaking,
    toggleMute,
    switchMicrophone,
    isMuted,
    addUserMessage,
    gameWords: gameStat,
    isVolumeOn,
    toggleVolume,
    setIsStarted,
    goalInfo,
    messageOrder: messages.messageOrder,
    setWebCamDescription,
    closeConversation,
    toggleConversationMode,
    conversationMode: settings.conversationMode,

    recordingVoiceMode,

    completeUserMessageDelta,
    addUserMessageDelta,
    isRestarting: false,
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
