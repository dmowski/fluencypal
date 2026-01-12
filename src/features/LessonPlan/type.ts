export interface LessonPlanStep {
  stepTitle: string;
  stepDescriptionForStudent: string;
  teacherInstructions: string;
}

export interface LessonPlan {
  steps: LessonPlanStep[];
}
