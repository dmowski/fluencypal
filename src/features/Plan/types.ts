import { GoalQuiz } from "@/app/api/goal/types";
import { SupportedLanguage } from "@/features/Lang/lang";

export type PlanElementMode = "conversation" | "words" | "play" | "rule";

export interface PlanElement {
  id: string;
  title: string; // one word
  subTitle: string; // 3 words
  mode: PlanElementMode;
  description: string;
  details: string;
  startCount: number;
}

export interface GoalPlan {
  id: string;
  title: string;
  elements: PlanElement[];
  createdAt: number;
  languageCode: SupportedLanguage;
  goalQuiz: GoalQuiz | null;
}

export type GoalElementInfo = {
  goalPlan: GoalPlan;
  goalElement: PlanElement;
};
