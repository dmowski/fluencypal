import { quizSteps, resolveQuizStep } from './quizSteps';

describe('resolveQuizStep', () => {
  it('keeps an active step', () => {
    expect(resolveQuizStep('before_recordAbout', quizSteps)).toBe('before_recordAbout');
    expect(resolveQuizStep('goalReview', quizSteps)).toBe('goalReview');
  });

  it('starts over when the step is not on the path', () => {
    expect(resolveQuizStep('recordAbout', quizSteps)).toBe('learnLanguage');
  });

  it('skips page-language when that pair is not on the path', () => {
    const withoutPageLang = quizSteps.filter(
      (step) => step !== 'pageLanguage' && step !== 'before_pageLanguage',
    );
    expect(resolveQuizStep('pageLanguage', withoutPageLang)).toBe('teacherSelection');
  });
});
