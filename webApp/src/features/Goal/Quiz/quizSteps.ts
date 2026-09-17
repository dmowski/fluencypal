export const quizSteps = [
  'learnLanguage',
  'before_nativeLanguage',
  'nativeLanguage',
  'before_pageLanguage',
  'pageLanguage',
  'teacherSelection',
  'before_recordAbout',
  'before_goalReview',
  'goalReview',
] as const;

export type QuizStep = (typeof quizSteps)[number];

export const resolveQuizStep = (step: string, path: readonly string[]): QuizStep => {
  if (path.includes(step)) {
    return step as QuizStep;
  }
  if (step === 'pageLanguage' || step === 'before_pageLanguage') {
    return path.includes('teacherSelection') ? 'teacherSelection' : (path[0] as QuizStep);
  }
  return (path[0] as QuizStep) || 'learnLanguage';
};
