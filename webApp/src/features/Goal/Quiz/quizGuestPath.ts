export const quizGuestPlanIntroStep = 'before_goalReview' as const;
export const quizGuestAboutStep = 'before_recordAbout' as const;

export const shouldSkipToPlanIntroAfterGuestAbout = ({
  currentStep,
  isSignedIn,
  hasGuestAbout,
}: {
  currentStep: string;
  isSignedIn: boolean;
  hasGuestAbout: boolean;
}): boolean => currentStep === quizGuestAboutStep && !isSignedIn && hasGuestAbout;

export const shouldReturnToGuestAboutFromPlanIntro = ({
  currentStep,
  isSignedIn,
  hasGuestAbout,
}: {
  currentStep: string;
  isSignedIn: boolean;
  hasGuestAbout: boolean;
}): boolean => currentStep === quizGuestPlanIntroStep && !isSignedIn && hasGuestAbout;
