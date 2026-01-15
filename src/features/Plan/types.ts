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

export type GoalElementProgressState = "in_progress" | "completed" | "started";

export interface ConversationResult {
  shortSummaryOfLesson: string;

  whatUserDidWell: string;
  whatUserCanImprove: string;

  whatToFocusOnNextTime: string;
}

export interface GoalElementProgress {
  elementId: string;
  state: GoalElementProgressState;
  startedAtIso: string;
  completedAtIso: string | null;

  results: ConversationResult | null;
}

export interface GoalPlan {
  id: string;
  title: string;
  elements: PlanElement[];
  createdAt: number;
  updatedAt: number;
  languageCode: SupportedLanguage;
  goalQuiz: GoalQuiz | null;

  progress?: GoalElementProgress[];
}

// Core type for user goal
export type GoalElementInfo = {
  goalPlan: GoalPlan;
  goalElement: PlanElement;
};
