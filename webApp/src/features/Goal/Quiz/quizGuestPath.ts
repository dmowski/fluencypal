export const quizGuestPlanIntroStep = 'before_goalReview' as const;
export const quizGuestAboutStep = 'before_recordAbout' as const;

export const shouldSkipToPlanIntroAfterGuestAbout = ({
  currentStep,
  isIdentified,
  hasGuestAbout,
}: {
  currentStep: string;
  isIdentified: boolean;
  hasGuestAbout: boolean;
}): boolean => currentStep === quizGuestAboutStep && !isIdentified && hasGuestAbout;

export const shouldReturnToGuestAboutFromPlanIntro = ({
  currentStep,
  isIdentified,
  hasGuestAbout,
}: {
  currentStep: string;
  isIdentified: boolean;
  hasGuestAbout: boolean;
}): boolean => currentStep === quizGuestPlanIntroStep && !isIdentified && hasGuestAbout;
