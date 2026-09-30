import { quizPath, quizSteps, resolveQuizStep } from './quizSteps';

describe('quizPath', () => {
  const path = quizPath({ includePageLanguage: false, activities: [] });

  it('asks for recording consent after the teacher, then the reason and a follow-up', () => {
    expect(path.indexOf('playerIdentity')).toBe(path.indexOf('teacherSelection') + 1);
    expect(path.indexOf('recordingConsent')).toBe(path.indexOf('playerIdentity') + 1);
    expect(path.indexOf('micPermission')).toBe(path.indexOf('recordingConsent') + 1);
    expect(path.indexOf('before_recordAbout')).toBe(path.indexOf('micPermission') + 1);
    expect(path.indexOf('recordAboutFollowUp')).toBe(path.indexOf('before_recordAbout') + 1);
    expect(path.indexOf('talkWithPeople')).toBe(path.indexOf('recordAboutFollowUp') + 1);
    expect(path.indexOf('communityRules')).toBe(path.indexOf('talkWithPeople') + 1);
    expect(path.indexOf('dailyPractice')).toBe(path.indexOf('communityRules') + 1);
    expect(path.indexOf('noReminders')).toBe(path.indexOf('dailyPractice') + 1);
    expect(path.indexOf('limitedAccess')).toBe(path.indexOf('noReminders') + 1);
    expect(path.indexOf('reviews')).toBe(path.indexOf('limitedAccess') + 1);
    expect(path.indexOf('activityChoice')).toBe(path.indexOf('reviews') + 1);
  });

  it('shows a feature screen only for the activities they picked', () => {
    const selected = quizPath({
      includePageLanguage: false,
      activities: ['read', 'speak'],
    });
    expect(selected.indexOf('featureDailyLesson')).toBe(selected.indexOf('activityChoice') + 1);
    expect(selected.indexOf('featureAiTalk')).toBe(selected.indexOf('featureDailyLesson') + 1);
    expect(selected.indexOf('featurePersonalPlan')).toBe(selected.indexOf('featureAiTalk') + 1);
    expect(selected.includes('featureGame')).toBe(false);
  });

  it('puts the plan, then sign-in, after the feature screens', () => {
    const selected = quizPath({ includePageLanguage: false, activities: ['quiz'] });
    expect(selected.indexOf('before_goalReview')).toBe(selected.indexOf('featureGame') + 1);
    expect(selected.indexOf('goalReview')).toBe(selected.indexOf('before_goalReview') + 1);
    expect(selected.includes('dailyQuestion')).toBe(false);
    expect(selected.indexOf('preAuth')).toBe(selected.indexOf('goalReview') + 1);
    expect(selected.indexOf('authWall')).toBe(selected.indexOf('preAuth') + 1);
    expect(selected[selected.length - 1]).toBe('authWall');
  });

  it('asks them to answer today only after the plan, and only if they want real people', () => {
    const selected = quizPath({
      includePageLanguage: false,
      activities: ['quiz'],
      includeDailyQuestion: true,
    });
    expect(selected.indexOf('dailyQuestion')).toBe(selected.indexOf('goalReview') + 1);
    expect(selected.indexOf('preAuth')).toBe(selected.indexOf('dailyQuestion') + 1);
    expect(selected.indexOf('talkWithPeople')).toBeLessThan(selected.indexOf('dailyQuestion'));
  });

  it('keeps page language when the native language is not a site language', () => {
    const withPage = quizPath({ includePageLanguage: true, activities: [] });
    expect(withPage.indexOf('pageLanguage')).toBe(withPage.indexOf('nativeLanguage') + 2);
  });
});

describe('resolveQuizStep', () => {
  it('keeps an active step', () => {
    expect(resolveQuizStep('recordingConsent', quizSteps)).toBe('recordingConsent');
    expect(resolveQuizStep('micPermission', quizSteps)).toBe('micPermission');
    expect(resolveQuizStep('before_recordAbout', quizSteps)).toBe('before_recordAbout');
    expect(resolveQuizStep('goalReview', quizSteps)).toBe('goalReview');
    expect(resolveQuizStep('authWall', quizSteps)).toBe('authWall');
  });

  it('starts over when the step is not on the path', () => {
    expect(resolveQuizStep('recordAbout', quizSteps)).toBe('learnLanguage');
    const withoutQuestion = quizPath({ includePageLanguage: false, activities: [] });
    expect(resolveQuizStep('dailyQuestion', withoutQuestion)).toBe('learnLanguage');
  });

  it('sends a hidden feature step back to the activity choice', () => {
    const withoutFeatures = quizPath({ includePageLanguage: false, activities: [] });
    expect(resolveQuizStep('featureGame', withoutFeatures)).toBe('activityChoice');
  });

  it('skips page-language when that pair is not on the path', () => {
    const withoutPageLang = quizSteps.filter(
      (step) => step !== 'pageLanguage' && step !== 'before_pageLanguage',
    );
    expect(resolveQuizStep('pageLanguage', withoutPageLang)).toBe('teacherSelection');
  });
});
