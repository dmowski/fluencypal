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

  // percentage of the lesson plan that has been covered so far: 0-100
  progress?: number;
}
