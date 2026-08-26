import { expect, test } from './fixtures';
import { createEmulatorTestUser, resetEmulatorState } from '../libs/books/auth';
import { signInUserOnDashboard } from '../libs/voice-chat/auth';

test.describe('Voice Chat shell', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('hides dashboard card and opens modal shell from URL', async ({ page }) => {
    const user = await createEmulatorTestUser();
    await signInUserOnDashboard(page, user);

    await expect(page.getByTestId('voice-chat-dashboard-card')).toHaveCount(0);

    await page.goto('/?voiceChat=true');
    await expect(page.getByTestId('voice-chat-modal')).toBeVisible();
    await expect(page.getByTestId('voice-chat-empty')).toBeVisible();
  });
});
