export interface LessonPlanStep {
  stepTitle: string;
  stepDescriptionForStudent: string;
  teacherInstructions: string;
}

export interface LessonPlan {
  steps: LessonPlanStep[];
}

export interface LessonPlanAnalysis {
  activeStepIndex: number;
  isFine: boolean;
  suggestionsToTeacher?: string;
  comments?: string;
}
