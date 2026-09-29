import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import {
  QuizAuthWallStep,
  QuizLimitedAccessStep,
  QuizNoRemindersStep,
  QuizPreAuthStep,
  QuizReviewsStep,
  QuizTalkWithPeopleStep,
} from './QuizExpectationSteps';
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

test('talk with real people', async () => {
  await render(
    <QuizShotFrame>
      <QuizTalkWithPeopleStep onChoose={() => undefined} isStepLoading={false} />
    </QuizShotFrame>,
  );
  await expect.element(page.getByText('Do you want to talk with real people?')).toBeVisible();
  await expectQuizScreenshot('onboarding-talk-with-people');
});

test('no reminders', async () => {
  await render(
    <QuizShotFrame>
      <QuizNoRemindersStep {...idle} />
    </QuizShotFrame>,
  );
  await expect.element(page.getByText('No reminders')).toBeVisible();
  await expectQuizScreenshot('onboarding-no-reminders');
});

test('limited access', async () => {
  await render(
    <QuizShotFrame>
      <QuizLimitedAccessStep {...idle} />
    </QuizShotFrame>,
  );
  await expect.element(page.getByRole('button', { name: 'Start Free' })).toBeVisible();
  await expectQuizScreenshot('onboarding-limited-access');
});

test('reviews', async () => {
  await render(
    <QuizShotFrame>
      <QuizReviewsStep pageLanguage="en" {...idle} />
    </QuizShotFrame>,
  );
  await expect.element(page.getByText('Alina Lachowska')).toBeVisible();
  await expectQuizScreenshot('onboarding-reviews');
});

test('pre auth', async () => {
  await render(
    <QuizShotFrame>
      <QuizPreAuthStep {...idle} />
    </QuizShotFrame>,
  );
  await expect.element(page.getByText('Sign in to use FluencyPal')).toBeVisible();
  await expectQuizScreenshot('onboarding-pre-auth');
});

test('auth wall', async () => {
  await render(
    <QuizShotFrame>
      <QuizAuthWallStep>{null}</QuizAuthWallStep>
    </QuizShotFrame>,
  );
  await expect.element(page.getByRole('button', { name: 'Create account' })).toBeVisible();
  await expect.element(page.getByRole('textbox', { name: 'Email' })).toBeVisible();
  await expect.element(page.getByRole('textbox', { name: 'Password' })).toBeVisible();
  await expect
    .element(page.getByText('Email and password. Your practice stays on this account.'))
    .toBeVisible();
  await expectQuizScreenshot('onboarding-auth-wall');
});
