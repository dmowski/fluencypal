export const quizSteps = [
  'learnLanguage',
  'before_nativeLanguage',
  'nativeLanguage',
  'before_pageLanguage',
  'pageLanguage',
  'teacherSelection',
  'playerIdentity',
  'recordingConsent',
  'micPermission',
  'before_recordAbout',
  'recordAboutFollowUp',
  'talkWithPeople',
  'dailyPractice',
  'noReminders',
  'limitedAccess',
  'reviews',
  'activityChoice',
  'featureDailyLesson',
  'featureGame',
  'featureAiTalk',
  'featurePersonalPlan',
  'before_goalReview',
  'goalReview',
  'preAuth',
  'authWall',
] as const;

export type QuizStep = (typeof quizSteps)[number];

export const practiceActivities = ['read', 'speak', 'quiz'] as const;
export type PracticeActivity = (typeof practiceActivities)[number];

const featureSteps: QuizStep[] = [
  'featureDailyLesson',
  'featureGame',
  'featureAiTalk',
  'featurePersonalPlan',
];

export const parsePracticeActivities = (value: string | null | undefined): PracticeActivity[] => {
  if (!value) return [];
  const selected = new Set<PracticeActivity>();
  value.split(',').forEach((part) => {
    const activity = part.trim();
    if ((practiceActivities as readonly string[]).includes(activity)) {
      selected.add(activity as PracticeActivity);
    }
  });
  return practiceActivities.filter((activity) => selected.has(activity));
};

export const quizPath = ({
  includePageLanguage,
  activities,
}: {
  includePageLanguage: boolean;
  activities: readonly string[];
}): QuizStep[] => {
  const selected = new Set(activities);
  return quizSteps.filter((step) => {
    if (step === 'pageLanguage' || step === 'before_pageLanguage') {
      return includePageLanguage;
    }
    if (step === 'featureDailyLesson') return selected.has('read');
    if (step === 'featureGame') return selected.has('quiz');
    if (step === 'featureAiTalk' || step === 'featurePersonalPlan') return selected.has('speak');
    return true;
  });
};

export const resolveQuizStep = (step: string, path: readonly string[]): QuizStep => {
  if (path.includes(step)) {
    return step as QuizStep;
  }
  if (step === 'pageLanguage' || step === 'before_pageLanguage') {
    return path.includes('teacherSelection') ? 'teacherSelection' : (path[0] as QuizStep);
  }
  if ((featureSteps as readonly string[]).includes(step)) {
    return path.includes('activityChoice') ? 'activityChoice' : (path[0] as QuizStep);
  }
  return (path[0] as QuizStep) || 'learnLanguage';
};
