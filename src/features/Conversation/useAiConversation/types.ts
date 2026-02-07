import { AiVoice } from '@/common/ai';
import { ConversationType, ConversationMessage, MessagesOrderMap } from '@/common/conversation';
import { ConversationMode } from '@/common/userSettings';
import { ConversationIdea } from '@/features/Ai/useAiUserInfo';
import { LessonPlan, LessonPlanAnalysis } from '@/features/LessonPlan/type';
import { GoalElementInfo } from '@/features/Plan/types';
import { GuessGameStat, RecordingUserMessageMode } from '../types';

export interface StartConversationProps {
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

export interface AiConversationContextType {
  isInitializing: string;
  isStarted: boolean;
  setIsStarted: (isStarted: boolean) => void;
  startConversation: (params: StartConversationProps) => Promise<void>;

  conversation: ConversationMessage[];
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

  conversationId: string | null;

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

  completeUserMessageDelta: (params: {
    triggerResponse?: boolean;
    removeMessage?: boolean;
  }) => Promise<void>;
  addUserMessageDelta: (delta: string) => void;

  isLimitedAiVoice: boolean;
  isLimitedRecording: boolean;
  isRestarting: boolean;
}
