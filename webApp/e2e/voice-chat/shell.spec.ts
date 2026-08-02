import { expect, test } from './fixtures';
import { createEmulatorTestUser, resetEmulatorState } from '../libs/books/auth';
import { signInUserOnDashboard } from '../libs/voice-chat/auth';

test.describe('Voice Chat shell', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('shows dashboard card for signed-in users and opens modal shell', async ({ page }) => {
    const user = await createEmulatorTestUser();
    await signInUserOnDashboard(page, user);

    await expect(page.getByTestId('voice-chat-dashboard-card')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Rules of chat' })).toBeVisible();
    await expect(page.getByText('Become a member')).toBeVisible();

    await page.goto('/?voiceChat=true');
    await expect(page.getByTestId('voice-chat-modal')).toBeVisible();
    await expect(page.getByTestId('voice-chat-empty')).toBeVisible();
  });
});
