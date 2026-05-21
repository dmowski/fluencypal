import { expect, test } from '@playwright/test';
import { installRealtimeConversationMock } from '../libs/conversation';
import {
  resetEmulatorState,
  seedPracticeUserSettings,
  signInPracticeWithStepper,
} from '../libs/practice';

/**
 * Smoke-tests the Just Talk conversation startup flow end-to-end.
 *
 * WebRTC signaling is mocked locally so the test does not depend on the live
 * OpenAI Realtime API or `OPENAI_API_KEY_WEB_RTC`.
 */
test.use({
  launchOptions: {
    args: [
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--remote-debugging-port=9222',
    ],
  },
  permissions: ['microphone', 'camera'],
});

test.describe('Just talk', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('starts a realtime conversation from the dashboard without errors', async ({ page }) => {
    await installRealtimeConversationMock(page);

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    const errorHeading = page.getByText('Oops! Something went wrong', { exact: true });

    // Trigger the Just-Talk flow from the dashboard card.
    const openButton = page.getByRole('button', { name: 'Open', exact: true }).first();
    await expect(openButton).toBeVisible();
    await openButton.click();

    // Just Talk starts in call mode (CameraCanvas), not the record-mode chat modal.
    const conversationCanvas = page.locator('#messages-call-mode, #conversation-canvas-modal');
    await expect(conversationCanvas).toBeVisible();
    await expect(errorHeading).toHaveCount(0);
  });
});
