export type LessonPartType = 'read' | 'speech';

export interface LessonPart {
  contentMD: string;
  type: LessonPartType;
}

export interface LessonResults {
  motivationTextToUserMD: string;
  whatWentWellMD: string;
}

export interface LessonPartWithUserAnswer extends LessonPart {
  userVoiceTranscript: string;
  aiResultToUser: string;
  userAudioUrl?: string;
}

export type LessonPartState = LessonPart | LessonPartWithUserAnswer;

export interface InteractiveLesson {
  id: string;
  title: string;
  subTitle: string;
  createdAtIso: string;
  completedAtIso: string | null;
  parts: LessonPartState[];
  lessonResults: LessonResults | null;
}

export interface LessonAudioRecord {
  id: string;
  audioUrl: string;
  transcript: string;
  recordedAtIso: string;
}

export interface LessonAudioProgress {
  first: LessonAudioRecord[];
  last: LessonAudioRecord[];
  totalCount: number;
}

export interface InteractiveLessonStore {
  currentLesson: InteractiveLesson | null;
  nextLesson: InteractiveLesson | null;
  history: InteractiveLesson[];
  lastCompletedAtIso: string | null;
  audioProgress: LessonAudioProgress;
}

export interface InteractiveLessonFirestoreDoc extends InteractiveLessonStore {
  languageCode: string;
  updatedAtIso: string;
}

export interface ConversationContextMessage {
  isBot: boolean;
  text: string;
}

export interface LessonGenerationContext {
  conversationText: string;
  conversationMessageCount: number;
  userGoalText: string;
  previousLessonsSummary: string;
  openTalkSummary: string;
  recentFormsSummary: string;
}

export const isLessonPartWithAnswer = (
  part: LessonPartState,
): part is LessonPartWithUserAnswer => {
  return 'userVoiceTranscript' in part;
};

export const isOpenTalkPart = (parts: LessonPartState[], partIndex: number): boolean => {
  return parts[partIndex]?.type === 'speech' && partIndex === parts.length - 1;
};

export const isReadAloudPart = (parts: LessonPartState[], partIndex: number): boolean => {
  if (isOpenTalkPart(parts, partIndex)) return false;
  return partIndex === 1 && parts[1]?.type === 'speech';
};
