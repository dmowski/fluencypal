import { SupportedLanguage } from "@/common/lang";

export interface CreateGoalRequest {
  languageToLearn: SupportedLanguage;
  level: string;
  description: string;
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
