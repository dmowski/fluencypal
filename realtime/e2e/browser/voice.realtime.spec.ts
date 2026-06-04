import { existsSync } from 'node:fs';
import { expect, test } from '@playwright/test';
import { voiceFixturePath, voiceFixturesSkipReason } from '../helpers/voiceFixtures.js';

const skipReason = voiceFixturesSkipReason({ browser: true });

const signInWithGoogle = async (page: import('@playwright/test').Page) => {
  await page.goto('/');
  await expect(page.locator('#use-emulator')).toBeChecked();
  await page.click('#sign-in-google');
  await expect(page.locator('#auth-status')).toContainText('Signed in', { timeout: 30_000 });
};

const waitForDebugLine = async (
  page: import('@playwright/test').Page,
  pattern: RegExp,
  timeoutMs = 120_000,
): Promise<void> => {
  await expect
    .poll(
      async () => {
        const lines = await page.evaluate(() => {
          const hooks = (
            window as unknown as {
              __realtimeE2e?: { getDebugLogLines: () => string[] };
            }
          ).__realtimeE2e;
          return hooks?.getDebugLogLines() ?? [];
        });
        return lines.some((line: string) => pattern.test(line));
      },
      { timeout: timeoutMs },
    )
    .toBe(true);
};

test.describe('realtime voice (browser)', () => {
  test('VC-05 sign-in, call, greeting, then user transcript from speech file', async ({ page }) => {
    test.skip(
      Boolean(skipReason) || !existsSync(voiceFixturePath('hello-48k-mono.wav')),
      skipReason ?? 'Missing hello-48k-mono.wav — run pnpm e2e:fixtures:voice',
    );

    await signInWithGoogle(page);

    await page.locator('#mic-muted').uncheck();
    await page.click('#connect');
    await expect(page.locator('#session-status')).toContainText('Session ready', { timeout: 30_000 });

    await page.click('#call-toggle');
    await expect(page.locator('#session-status')).toContainText(/greeting|listening/i, {
      timeout: 30_000,
    });

    await waitForDebugLine(page, /\[ws\] transcript\.done.*"role":"assistant"/);
    await waitForDebugLine(page, /\[audio\] tts_played/);

    await expect(page.locator('#session-status')).toContainText('listening', { timeout: 90_000 });

    await expect(page.locator('#transcript .message.assistant').first()).toBeVisible({
      timeout: 90_000,
    });

    await expect(page.locator('#transcript .message.user').first()).toBeVisible({
      timeout: 120_000,
    });

    await waitForDebugLine(page, /\[ws\] transcript\.done.*"role":"user"/);

    const debugText = await page.evaluate(() => {
      const hooks = (
        window as unknown as {
          __realtimeE2e?: { getDebugLogText: () => string };
        }
      ).__realtimeE2e;
      return hooks?.getDebugLogText() ?? '';
    });
    expect(debugText).toMatch(/usage.*stt|"stage":"stt"/);
    expect(debugText).not.toMatch(/server_interrupted/);
  });
});
