import { SupportedLanguage } from '@/features/Lang/lang';

export interface DailyQuestion {
  id: string;
  title: string;
  description: string;
  exampleAnswer: string;
  hints: string[];
  minWords: number;
  imageUrl?: string;
}

export type DailyQuestions = Record<string, DailyQuestion>;

export interface UserDailyQuestion {
  id: string;
  authorUserId: string;
  title: string;
  description: string;
  dayKey: string;
  imageUrl: string;
  createdAtIso: string;
  updatedAtIso: string;
}

export interface DailyQuestionAnswer {
  authorUserId: string;
  questionId: string;

  answerLanguage: SupportedLanguage;
  aiSuggestion?: {
    sourceMessage: string;
    correctedMessage: string;
    rate: number | null;
  } | null;
  transcript: string;

  isPublished: boolean;

  createdAtIso: string;
  updatedAtIso: string;
}

export type LikeType = 'like' | 'star';
export interface DailyQuestionLike {
  answerId: string;
  likeUserId: string;
  likeType: LikeType;
  createdAtIso: string;
}
