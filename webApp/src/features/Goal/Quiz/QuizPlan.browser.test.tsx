import React from 'react';
import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { useLingui } from '@lingui/react';
import { GoalPlan } from '@/features/Plan/types';
import { QuizBeforeGoalReviewStep } from './QuizBeforeGoalReviewStep';
import { GoalReview } from './GoalReview';
import { FirstCallFinishedNotice } from '@/features/Conversation/CallMode/FirstCallFinishedNotice';
import { expectQuizScreenshot, QuizShotFrame } from './quizBrowserFrame';

vi.mock('@/features/Layout/useWindowSizes', () => ({
  useWindowSizes: () => ({
    topOffset: '0px',
    bottomOffset: '0px',
  }),
}));

vi.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt }: { src: string; alt?: string }) =>
    React.createElement('img', { src, alt: alt || '' }),
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

const goalData: GoalPlan = {
  id: 'plan-1',
  title: 'Pass a medical job interview',
  createdAt: 1,
  updatedAt: 1,
  languageCode: 'en',
  elements: [
    {
      id: '1',
      title: 'Introduce yourself',
      subTitle: 'Opening',
      mode: 'conversation',
      description: '',
      details: 'Say who you are and what you do as a doctor.',
      startCount: 0,
    },
    {
      id: '2',
      title: 'Explain a case',
      subTitle: 'Work',
      mode: 'play',
      description: '',
      details: 'Walk through a patient story in clear English.',
      startCount: 0,
    },
    {
      id: '3',
      title: 'Interview phrases',
      subTitle: 'Words',
      mode: 'words',
      description: '',
      details: 'Phrases for questions about your experience.',
      startCount: 0,
    },
  ],
};

const PracticePlan = () => {
  const { i18n } = useLingui();
  return (
    <GoalReview
      onClick={() => undefined}
      isLoading={false}
      goalData={goalData}
      actionButtonLabel={i18n._('Continue')}
    />
  );
};

test('ready to craft the plan', async () => {
  await render(
    <QuizShotFrame>
      <QuizBeforeGoalReviewStep onContinue={() => undefined} isStepLoading={false} />
    </QuizShotFrame>,
  );
  await expectQuizScreenshot('onboarding-before-goal-review');
});

test('practice plan', async () => {
  await render(
    <QuizShotFrame>
      <PracticePlan />
    </QuizShotFrame>,
  );
  await expect.element(page.getByText('Assessing your progress')).toBeVisible();
  await expect.element(page.getByRole('button', { name: 'Continue' })).toBeVisible();
  await expectQuizScreenshot('onboarding-goal-review');
});

test('first call finished without a paywall', async () => {
  await render(
    <QuizShotFrame>
      <FirstCallFinishedNotice onClose={() => undefined} />
    </QuizShotFrame>,
  );
  await expect.element(page.getByTestId('onboarding-call-finished')).toBeVisible();
  await expect.element(page.getByTestId('onboarding-call-close')).toBeVisible();
  await expectQuizScreenshot('onboarding-first-call-finished');
});
