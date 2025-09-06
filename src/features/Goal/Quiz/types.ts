import { SupportedLanguage } from "@/features/Lang/lang";
import type { GoalElementInfo } from "@/features/Plan/types";

export interface QuizSurvey2 {
  learningLanguageCode: SupportedLanguage;
  nativeLanguageCode: string;
  pageLanguageCode: SupportedLanguage;

  aboutUserTranscription: string;
  aboutUserFollowUpQuestion: string;
  aboutUserFollowUpAnswer: string;
  aboutUserAnalysis: string;
  aboutUserInfoRecords: string[]; // list of short notes about user

  goalQuestion: string;
  goalUserAnswer: string;
  goalFollowUpQuestion: string;
  goalFollowUpAnswer: string;
  goalAnalysis: string;

  goalData: GoalElementInfo | null;

  createdAtIso: string;
  updatedAtIso: string;
}
