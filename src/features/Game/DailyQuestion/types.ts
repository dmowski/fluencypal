import { SupportedLanguage } from "@/features/Lang/lang";

export interface DailyQuestion {
  id: string;
  title: string;
  description: string;
  exampleAnswer: string;
  hints: string[];
  minWords: number;
}

export type DailyQuestions = Record<string, DailyQuestion>;

export interface DailyQuestionAnswer {
  authorUserId: string;
  questionId: string;

  answerLanguage: SupportedLanguage;
  transcript: string;

  isPublished: boolean;

  createdAtIso: string;
  updatedAtIso: string;
}

export type LikeType = "like" | "star";
export interface DailyQuestionLike {
  answerId: string;
  likeUserId: string;
  likeType: LikeType;
  createdAtIso: string;
}
