import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import {
  QuizActivityChoiceStep,
  QuizFeatureAiTalkStep,
  QuizFeatureDailyLessonStep,
  QuizFeatureGameStep,
  QuizFeaturePersonalPlanStep,
} from './QuizActivitySteps';
import { expectQuizScreenshot, QuizShotFrame } from './quizBrowserFrame';

vi.mock('@/features/Auth/useAuth', () => ({
  useAuth: () => ({
    uid: 'fixture-user',
    loading: false,
    isIdentified: false,
    userInfo: null,
    signInWithGoogle: async () => ({ isDone: false, isRedirecting: false, error: '' }),
    signInWithEmail: async () => ({ isDone: false, error: '' }),
  }),
}));

const idle = { onContinue: () => undefined, isStepLoading: false };

test('activity choice', async () => {
  await render(
    <QuizShotFrame>
      <QuizActivityChoiceStep onContinue={() => undefined} isStepLoading={false} />
    </QuizShotFrame>,
  );
  await expect.element(page.getByText('What feels most comfortable right now?')).toBeVisible();
  await expectQuizScreenshot('onboarding-activity-choice');
});

test('activity choice with a selection', async () => {
  await render(
    <QuizShotFrame>
      <QuizActivityChoiceStep onContinue={() => undefined} isStepLoading={false} />
    </QuizShotFrame>,
  );
  await page.getByRole('button', { name: /Read/ }).click();
  await page.getByRole('button', { name: /Speak/ }).click();
  await expect.element(page.getByRole('button', { name: 'Continue' })).toBeEnabled();
  await expectQuizScreenshot('onboarding-activity-choice-selected');
});

test('daily speaking lesson', async () => {
  await render(
    <QuizShotFrame>
      <QuizFeatureDailyLessonStep {...idle} />
    </QuizShotFrame>,
  );
  await expect.element(page.getByText('Daily speaking lesson')).toBeVisible();
  await expectQuizScreenshot('onboarding-feature-daily-lesson');
});

test('game', async () => {
  await render(
    <QuizShotFrame>
      <QuizFeatureGameStep {...idle} />
    </QuizShotFrame>,
  );
  await expect.element(page.getByText('The game')).toBeVisible();
  await expectQuizScreenshot('onboarding-feature-game');
});

test('AI talking', async () => {
  await render(
    <QuizShotFrame>
      <QuizFeatureAiTalkStep {...idle} />
    </QuizShotFrame>,
  );
  await expect.element(page.getByText('Talk with the AI teacher')).toBeVisible();
  await expectQuizScreenshot('onboarding-feature-ai-talk');
});

test('personal plan feature', async () => {
  await render(
    <QuizShotFrame>
      <QuizFeaturePersonalPlanStep {...idle} />
    </QuizShotFrame>,
  );
  await expect.element(page.getByText('Your personal plan')).toBeVisible();
  await expectQuizScreenshot('onboarding-feature-personal-plan');
});
