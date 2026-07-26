import { expect, test } from './fixtures';
import { createEmulatorTestUser, resetEmulatorState } from '../libs/books/auth';
import { signInFounderOnDashboard, signInUserOnDashboard } from '../libs/voice-chat/auth';

test.describe('Voice Chat shell', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('hides dashboard card for non-founder users', async ({ page }) => {
    const user = await createEmulatorTestUser();
    await signInUserOnDashboard(page, user);
    await expect(page.getByTestId('voice-chat-dashboard-card')).toHaveCount(0);
  });

  test('shows dashboard card for founder and opens modal shell', async ({ page }) => {
    await signInFounderOnDashboard(page);

    await expect(page.getByTestId('voice-chat-dashboard-card')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Rules of chat' })).toBeVisible();
    await expect(page.getByText('Become a member')).toBeVisible();

    await page.goto('/?voiceChat=true');
    await expect(page.getByTestId('voice-chat-modal')).toBeVisible();
    await expect(page.getByTestId('voice-chat-empty')).toBeVisible();
  });
});
