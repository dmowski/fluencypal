import { expect, test } from '@playwright/test';
import {
  resetEmulatorState,
  seedPracticeUserSettings,
  signInPracticeWithStepper,
} from '../libs/practice';

test.describe('News dashboard card', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('shows the Current Events section on the practice dashboard', async ({ page }) => {
    test.setTimeout(90_000);

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    const card = page.getByTestId('news-dashboard-card');
    await expect(card).toBeVisible({ timeout: 30_000 });

    await expect(card.getByRole('heading', { name: 'Current Events' })).toBeVisible();
    await expect(
      card.getByText('AI-generated English learning content inspired by current events'),
    ).toBeVisible();
  });
});
