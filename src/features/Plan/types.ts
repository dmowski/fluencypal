import { SupportedLanguage } from "@/common/lang";

export type PlanElementMode = "conversation" | "words" | "play" | "rule";

export interface PlanElement {
  id: string;
  title: string; // one word
  subTitle: string; // 3 words
  mode: PlanElementMode;
  description: string;
  startCount: number;

  preparingInstructionForAi: string;
  instructionForAi: string;
}

export interface GoalPlan {
  id: string;
  title: string;
  elements: PlanElement[];
  createdAt: number;
  languageCode: SupportedLanguage;
}

export type GoalElementInfo = {
  goalPlan: GoalPlan;
  goalElement: PlanElement;
};
