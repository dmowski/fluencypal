import { SupportedLanguage } from "@/features/Lang/lang";

export interface CreateGoalRequest {
  languageToLearn: SupportedLanguage;
  level: string;
  description: string;
  minPerDaySelected: number;
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
