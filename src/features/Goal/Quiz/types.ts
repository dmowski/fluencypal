import { SupportedLanguage } from "@/features/Lang/lang";
import type { GoalPlan } from "@/features/Plan/types";
import { NativeLangCode } from "@/libs/language/type";

export interface QuizSurvey2FollowUpQuestion {
  sourceTranscription: string;
  title: string;
  subtitle: string;
  description?: string;
  hash: string;
}

export interface QuizSurvey2 {
  learningLanguageCode: SupportedLanguage;
  nativeLanguageCode: NativeLangCode;
  pageLanguageCode: SupportedLanguage;

  aboutUserTranscription: string;

  aboutUserFollowUpQuestion: QuizSurvey2FollowUpQuestion;
  aboutUserFollowUpTranscription: string;

  goalFollowUpQuestion: QuizSurvey2FollowUpQuestion;
  goalUserTranscription: string;

  goalData: GoalPlan | null;
  goalHash: string;
  userRecords: string[];

  createdAtIso: string;
  updatedAtIso: string;
}
