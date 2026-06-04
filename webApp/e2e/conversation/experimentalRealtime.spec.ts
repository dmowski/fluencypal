import { expect, test } from '@playwright/test';

import { MOCK_EXPERIMENTAL_REALTIME_ASSISTANT_TEXT } from '../libs/conversation/realtimeWsMock';
import {
  prepareExperimentalPracticePage,
  startExperimentalCustomRealtime,
} from '../libs/conversation/practice';
import { resetEmulatorState } from '../libs/practice';

test.describe('Experimental custom realtime (Just Talk)', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('starts call via WebSocket mock and shows assistant transcript', async ({ page }) => {
    await prepareExperimentalPracticePage(page);

    await expect(page.getByTestId('experimental-dashboard-card')).toBeVisible();
    await startExperimentalCustomRealtime(page);

    await expect(page.getByText('Calling...')).toBeHidden({ timeout: 15_000 });

    await expect(
      page.getByRole('button', { name: /Enable microphone/i }),
    ).toBeVisible({ timeout: 15_000 });

    await expect(page.getByText(MOCK_EXPERIMENTAL_REALTIME_ASSISTANT_TEXT)).toBeVisible({
      timeout: 15_000,
    });
  });
});
