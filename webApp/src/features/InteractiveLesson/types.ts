import { READ_ALOUD_MIN_CONTENT_CHARS } from './constants';

export type LessonPartType = 'read' | 'speech';

export type LessonPartRole = 'lessonFeedback';

export interface LessonPart {
  contentMD: string;
  type: LessonPartType;
  /** Set on the closing note. Absent on language-practice parts and older lessons. */
  role?: LessonPartRole;
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
  /** False/absent on older stores that mixed read-aloud and short answers. */
  openTalkOnly?: boolean;
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
  /** How the lesson felt and what they want next. Newest first. */
  lessonFeedbackSummary: string;
  recentFormsSummary: string;
}

export const isLessonPartWithAnswer = (part: LessonPartState): part is LessonPartWithUserAnswer => {
  return 'userVoiceTranscript' in part;
};

export const isLessonFeedbackPart = (part: LessonPartState | undefined): boolean => {
  return part?.role === 'lessonFeedback';
};

/** Last speech part that is not the closing feedback note. Older lessons have no note, so the last speech part stays the open talk. */
export const isOpenTalkPart = (parts: LessonPartState[], partIndex: number): boolean => {
  if (parts[partIndex]?.type !== 'speech' || isLessonFeedbackPart(parts[partIndex])) return false;

  for (let index = parts.length - 1; index >= 0; index -= 1) {
    const part = parts[index];
    if (part?.type !== 'speech' || isLessonFeedbackPart(part)) continue;
    return index === partIndex;
  }
  return false;
};

export const isReadAloudPart = (parts: LessonPartState[], partIndex: number): boolean => {
  if (parts[partIndex]?.type !== 'speech' || isOpenTalkPart(parts, partIndex)) return false;

  // New lessons: short pattern drill (index 1) then long passage (index 2).
  // Older lessons: only the second part is the long read-aloud.
  if (partIndex === 1) return true;
  if (partIndex !== 2) return false;

  const secondLen = parts[1]?.contentMD.trim().length ?? 0;
  const thirdLen = parts[2]?.contentMD.trim().length ?? 0;
  // Long passage after a short drill — not a form-check after a legacy long read-aloud.
  return (
    secondLen > 0 &&
    secondLen < READ_ALOUD_MIN_CONTENT_CHARS &&
    thirdLen >= READ_ALOUD_MIN_CONTENT_CHARS
  );
};
