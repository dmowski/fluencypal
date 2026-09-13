import {
  shouldReturnToGuestAboutFromPlanIntro,
  shouldSkipToPlanIntroAfterGuestAbout,
} from './quizGuestPath';

describe('quizGuestPath', () => {
  it('sends an unsigned guest from the about clip to the plan intro', () => {
    expect(
      shouldSkipToPlanIntroAfterGuestAbout({
        currentStep: 'before_recordAbout',
        isSignedIn: false,
        hasGuestAbout: true,
      }),
    ).toBe(true);
  });

  it('keeps the signed-in path on recordAbout', () => {
    expect(
      shouldSkipToPlanIntroAfterGuestAbout({
        currentStep: 'before_recordAbout',
        isSignedIn: true,
        hasGuestAbout: true,
      }),
    ).toBe(false);
  });

  it('does not skip before the guest has recorded', () => {
    expect(
      shouldSkipToPlanIntroAfterGuestAbout({
        currentStep: 'before_recordAbout',
        isSignedIn: false,
        hasGuestAbout: false,
      }),
    ).toBe(false);
  });

  it('returns an unsigned guest from the plan intro to the about clip', () => {
    expect(
      shouldReturnToGuestAboutFromPlanIntro({
        currentStep: 'before_goalReview',
        isSignedIn: false,
        hasGuestAbout: true,
      }),
    ).toBe(true);
  });
});
