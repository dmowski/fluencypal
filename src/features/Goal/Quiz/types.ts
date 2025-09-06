import { SupportedLanguage } from "@/features/Lang/lang";
import type { GoalElementInfo } from "@/features/Plan/types";

export interface QuizSurvey2 {
  learningLanguageCode: SupportedLanguage;
  nativeLanguage: string | null;
  pageLanguage: SupportedLanguage | null;

  aboutUserTranscription: string | null;
  aboutUserFollowUpQuestion: string | null;
  aboutUserFollowUpAnswer: string | null;
  aboutUserAnalysis: string | null;
  aboutUserInfoRecords: string[]; // list of short notes about user

  goalQuestion: string | null;
  goalUserAnswer: string | null;
  goalFollowUpQuestion: string | null;
  goalFollowUpAnswer: string | null;
  goalAnalysis: string | null;

  updatedAtIso: string;

  goalData: GoalElementInfo;
}
