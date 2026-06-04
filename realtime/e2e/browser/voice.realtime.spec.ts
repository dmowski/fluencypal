import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import {
  CASE_2_MIC_WAV,
  CASE_2_WAV,
  USER_RECORDING_MIC_WAV,
  USER_RECORDING_WAV,
  type UserRecordingWav,
  voiceFixturePath,
  voiceFixturesSkipReason,
} from '../helpers/voiceFixtures.js';

const signInWithGoogle = async (page: import('@playwright/test').Page) => {
  await page.goto('/');
  await expect(page.locator('#use-emulator')).toBeChecked();
  await page.click('#sign-in-google');
  await expect(page.locator('#auth-status')).toContainText('Signed in', { timeout: 30_000 });
};

const getDebugLines = async (page: import('@playwright/test').Page): Promise<string[]> =>
  page.evaluate(() => {
    const hooks = (
      window as unknown as {
        __realtimeE2e?: { getDebugLogLines: () => string[] };
      }
    ).__realtimeE2e;
    return hooks?.getDebugLogLines() ?? [];
  });

const waitForDebugLine = async (
  page: import('@playwright/test').Page,
  pattern: RegExp,
  timeoutMs = 180_000,
): Promise<void> => {
  await expect
    .poll(async () => {
      const lines = await getDebugLines(page);
      return lines.some((line: string) => pattern.test(line));
    }, { timeout: timeoutMs })
    .toBe(true);
};

/** First assistant reply after user must play through without client cancel / server interrupt. */
const assertAssistantReplyPlaybackCompleted = (lines: string[], userLineIndex: number): void => {
  const afterUser = lines.slice(userLineIndex);
  expect(afterUser.some((line) => /local_barge_in|server_interrupted/.test(line))).toBe(false);
  expect(afterUser.some((line) => /\[ws\] assistant\.interrupted/.test(line))).toBe(false);

  const playbackStartIdx = afterUser.findIndex((line) => /\[audio\] playback_start/.test(line));
  expect(playbackStartIdx).toBeGreaterThanOrEqual(0);

  const tail = afterUser.slice(playbackStartIdx);
  const doneIdx = tail.findIndex((line) => /\[audio\] playback_done/.test(line));
  const cancelledIdx = tail.findIndex((line) => /\[audio\] playback_cancelled/.test(line));

  expect(doneIdx).toBeGreaterThanOrEqual(0);
  if (cancelledIdx >= 0) {
    expect(doneIdx).toBeLessThan(cancelledIdx);
  }
};

const runVoiceCallScenario = async (
  page: import('@playwright/test').Page,
  _recording: UserRecordingWav,
): Promise<void> => {
  await signInWithGoogle(page);

  await page.locator('#mic-muted').uncheck();
  await page.click('#connect');
  await expect(page.locator('#session-status')).toContainText('Session ready', { timeout: 30_000 });

  await page.click('#call-toggle');
  await expect(page.locator('#session-status')).toContainText(/on call|greeting|listening/i, {
    timeout: 15_000,
  });

  await waitForDebugLine(page, /\[ws\] transcript\.done.*"role":"user"/, 180_000);
  await expect(page.locator('#transcript .message.user').first()).toBeVisible({ timeout: 180_000 });

  await waitForDebugLine(page, /\[ws\] transcript\.done.*"role":"assistant"/, 180_000);

  const lines = await getDebugLines(page);
  const userLineIndex = lines.findIndex((line) =>
    /\[ws\] transcript\.done.*"role":"user"/.test(line),
  );
  expect(userLineIndex).toBeGreaterThanOrEqual(0);

  await waitForDebugLine(page, /\[audio\] playback_done/, 120_000);
  assertAssistantReplyPlaybackCompleted(lines, userLineIndex);

  await page.click('#call-toggle');
};

test.describe('realtime voice (browser)', () => {
  test('VC-09 whats-your-name: reply plays through without spurious cancel', async ({ page }) => {
    const skipReason = voiceFixturesSkipReason({ browser: true, recording: USER_RECORDING_WAV });
    test.skip(
      Boolean(skipReason) ||
        !existsSync(voiceFixturePath(USER_RECORDING_WAV)) ||
        !existsSync(voiceFixturePath(USER_RECORDING_MIC_WAV)),
      skipReason ?? 'run pnpm e2e:fixtures:normalize',
    );
    await runVoiceCallScenario(page, USER_RECORDING_WAV);
  });

  test('VC-10 case-2: reply plays through without local_barge_in', async ({ page }) => {
    const skipReason = voiceFixturesSkipReason({ browser: true, recording: CASE_2_WAV });
    test.skip(
      Boolean(skipReason) ||
        !existsSync(voiceFixturePath(CASE_2_WAV)) ||
        !existsSync(voiceFixturePath(CASE_2_MIC_WAV)),
      skipReason ?? 'run pnpm e2e:fixtures:normalize',
    );
    await runVoiceCallScenario(page, CASE_2_WAV);
  });
});
