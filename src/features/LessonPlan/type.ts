export interface LessonPlanStep {
  stepTitle: string;
  stepDescriptionForStudent: string;
  teacherInstructions: string;
}

export interface LessonPlan {
  steps: LessonPlanStep[];
}

export interface LessonPlanAnalysis {
  teacherResponse?: string;
  isFollowingPlan?: boolean;
  progress?: number;
}
