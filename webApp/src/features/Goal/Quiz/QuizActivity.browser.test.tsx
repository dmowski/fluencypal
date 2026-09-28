import React from 'react';
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

const setVoice = async () => undefined;

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt?: string }) =>
    React.createElement('img', {
      src,
      alt: alt || '',
      style: {
        position: 'absolute',
        inset: '0',
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      },
    }),
}));

vi.mock('@/features/Settings/useSettings', () => ({
  useSettings: () => ({
    aiVoiceSpeed: 'slow',
    voice: 'shimmer',
    languageCode: 'en',
    userSettings: { languageCode: 'en' },
    setVoice,
  }),
}));

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

const waitForCardImage = async () => {
  await expect
    .poll(async () => {
      const img = page.getByRole('img', { name: 'Preview' }).element() as HTMLImageElement;
      return img.complete && img.naturalWidth > 0;
    })
    .toBe(true);
};

test('daily speaking lesson', async () => {
  await render(
    <QuizShotFrame>
      <QuizFeatureDailyLessonStep {...idle} />
    </QuizShotFrame>,
  );
  await expect.element(page.getByText('Daily speaking lesson')).toBeVisible();
  await waitForCardImage();
  await expectQuizScreenshot('onboarding-feature-daily-lesson');
});

test('game', async () => {
  await render(
    <QuizShotFrame>
      <QuizFeatureGameStep {...idle} />
    </QuizShotFrame>,
  );
  await expect.element(page.getByText('The game')).toBeVisible();
  await waitForCardImage();
  await expectQuizScreenshot('onboarding-feature-game');
});

test('AI talking', async () => {
  await render(
    <QuizShotFrame>
      <QuizFeatureAiTalkStep {...idle} />
    </QuizShotFrame>,
  );
  await expect.element(page.getByText('Talk with the AI teacher')).toBeVisible();
  await waitForCardImage();
  await expectQuizScreenshot('onboarding-feature-ai-talk');
});

test('personal plan feature', async () => {
  await render(
    <QuizShotFrame>
      <QuizFeaturePersonalPlanStep {...idle} />
    </QuizShotFrame>,
  );
  await expect.element(page.getByTestId('quiz-feature-personal-plan')).toBeVisible();
  await waitForCardImage();
  await expectQuizScreenshot('onboarding-feature-personal-plan');
});
