export interface LessonPlanStep {
  stepTitle: string;
  stepDescriptionForStudent: string;
  teacherInstructions: string;
}

export interface LessonPlan {
  steps: LessonPlanStep[];
}

export interface LessonPlanAnalysis {
  isFine: boolean;
  suggestionsToTeacher?: string;
  teacherResponse?: string;
  progress?: number;

  comments?: string;
}
