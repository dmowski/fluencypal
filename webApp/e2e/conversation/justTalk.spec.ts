import { expect, test } from '@playwright/test';
import {
  resetEmulatorState,
  seedPracticeUserSettings,
  signInPracticeWithStepper,
} from '../libs/practice';

/**
 * Smoke-tests the realtime conversation flow end-to-end against the real
 * OpenAI Realtime API (no AI mocking) to guard against regressions like
 * the GA-API migration where the `/v1/realtime/sessions` endpoint was
 * disabled in favour of `/v1/realtime/client_secrets`.
 *
 * Requires `OPENAI_API_KEY_WEB_RTC` to be configured for the dev server.
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
    test.setTimeout(120_000);

    const { uid, email } = await signInPracticeWithStepper(page);
    await seedPracticeUserSettings(page, { uid, email });

    const errorHeading = page.getByText('Oops! Something went wrong', { exact: true });

    // Trigger the Just-Talk flow from the dashboard card.
    const openButton = page.getByRole('button', { name: 'Open', exact: true }).first();
    await expect(openButton).toBeVisible({ timeout: 15_000 });
    await openButton.click();

    // The dashboard card flips into a loading state; wait for the call UI to
    // render. The conversation canvas modal mounts only after the ephemeral
    // token endpoint and the WebRTC SDP exchange both succeed.
    const conversationCanvas = page.locator('#conversation-canvas-modal');
    await Promise.race([
      conversationCanvas.waitFor({ state: 'visible', timeout: 60_000 }),
      errorHeading.waitFor({ state: 'visible', timeout: 60_000 }).then(() => {
        throw new Error('Conversation surfaced "Oops! Something went wrong"');
      }),
    ]);

    // Final guard: the error banner must not be present once the call is
    // established.
    await expect(errorHeading).toHaveCount(0);
  });
});
