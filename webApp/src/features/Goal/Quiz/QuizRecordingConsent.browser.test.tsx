import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { QuizMicPermissionStep, QuizRecordingConsentStep } from './QuizRecordingConsentStep';
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

vi.mock('@/libs/mic', () => ({
  requestMicrophoneAccess: async () => false,
}));

vi.mock('@/features/Analytics/Custom/sendOutcomeEvents', () => ({
  sendPermission: () => undefined,
  sendUiError: () => undefined,
}));

test('recording consent', async () => {
  await render(
    <QuizShotFrame>
      <QuizRecordingConsentStep
        pageLanguage="en"
        onContinue={() => undefined}
        isStepLoading={false}
      />
    </QuizShotFrame>,
  );
  await expect.element(page.getByText('Before you record your voice')).toBeVisible();
  await expect.element(page.getByRole('link', { name: 'Privacy Policy' })).toBeVisible();
  await expect.element(page.getByRole('link', { name: 'Terms of Use' })).toBeVisible();
  await expectQuizScreenshot('onboarding-recording-consent');
});

test('microphone permission', async () => {
  await render(
    <QuizShotFrame>
      <QuizMicPermissionStep onContinue={() => undefined} isStepLoading={false} />
    </QuizShotFrame>,
  );
  await expect.element(page.getByRole('button', { name: 'Allow microphone' })).toBeVisible();
  await expectQuizScreenshot('onboarding-mic-permission');
});

test('microphone permission when access is blocked', async () => {
  await render(
    <QuizShotFrame>
      <QuizMicPermissionStep onContinue={() => undefined} isStepLoading={false} />
    </QuizShotFrame>,
  );
  await page.getByRole('button', { name: 'Allow microphone' }).click();
  await expect.element(page.getByTestId('quiz-mic-denied')).toBeVisible();
  await expectQuizScreenshot('onboarding-mic-permission-denied');
});
