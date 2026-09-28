import { expect, test, vi } from 'vitest';
import { render } from 'vitest-browser-react';
import { page } from 'vitest/browser';
import { BrowserAppShell } from '@/test-utils/browserAppShell';
import { QuizDailyPracticeStep } from './QuizDailyPracticeStep';

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

test('daily practice', async () => {
  await render(
    <BrowserAppShell>
      <div data-testid="shot" style={{ width: '600px', background: 'rgba(10, 18, 30, 1)' }}>
        <QuizDailyPracticeStep onContinue={() => undefined} isStepLoading={false} />
      </div>
    </BrowserAppShell>,
  );

  await expect.element(page.getByTestId('shot')).toBeVisible();
  await expect.element(page.getByTestId('shot')).toMatchScreenshot('onboarding-daily-practice');
});
