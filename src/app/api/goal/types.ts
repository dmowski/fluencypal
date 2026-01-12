import { SupportedLanguage } from "@/features/Lang/lang";
import { NativeLangCode } from "@/libs/language/type";

export interface CreateGoalRequest {
  languageToLearn: SupportedLanguage;
  level: string;
  description: string;
  nativeLanguageCode: NativeLangCode | null;
}

export interface CreateGoalResponse {
  id: string;
}

export interface GoalQuiz extends CreateGoalRequest {
  isCreated: boolean;
  id: string;
  createdAtHuman: string;
  createdAt: number;
}
