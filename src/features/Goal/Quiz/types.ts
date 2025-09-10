import { SupportedLanguage } from "@/features/Lang/lang";
import type { GoalElementInfo } from "@/features/Plan/types";

export interface QuizSurvey2FollowUpQuestion {
  sourceTranscription: string;
  title: string;
  subtitle: string;
  description?: string;
}

export interface QuizSurvey2 {
  learningLanguageCode: SupportedLanguage;
  nativeLanguageCode: string;
  pageLanguageCode: SupportedLanguage;

  aboutUserTranscription: string;
  aboutUserFollowUpQuestion: QuizSurvey2FollowUpQuestion;

  aboutUserFollowUpTranscription: string;
  aboutUserAnalysis: string;
  aboutUserInfoRecords: string[]; // list of short notes about user

  goalUserTranscription: string;
  goalFollowUpQuestion: QuizSurvey2FollowUpQuestion;

  goalFollowUpTranscription: string;
  goalAnalysis: string;

  goalData: GoalElementInfo | null;

  createdAtIso: string;
  updatedAtIso: string;
}
