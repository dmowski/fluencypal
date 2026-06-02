import { expect, test } from '@playwright/test';

const signInWithGoogle = async (page: import('@playwright/test').Page) => {
  await page.goto('/');
  await expect(page.locator('#use-emulator')).toBeChecked();
  await page.click('#sign-in-google');
  await expect(page.locator('#auth-status')).toContainText('Signed in', { timeout: 15_000 });
};

test.describe('test client (browser)', () => {
  test('signs in, connects, and disconnects', async ({ page }) => {
    await signInWithGoogle(page);

    await page.click('#connect');
    await expect(page.locator('#session-status')).toContainText('Session ready', { timeout: 15_000 });
    await expect(page.locator('#disconnect')).toBeEnabled();

    await page.click('#disconnect');
    await expect(page.locator('#session-status')).toContainText('Disconnected', { timeout: 15_000 });
  });

  test('typed message produces user and assistant transcripts', async ({ page }) => {
    test.skip(!process.env.OPENAI_API_KEY, 'Requires OPENAI_API_KEY for LLM pipeline');

    await signInWithGoogle(page);

    await page.locator('#voice-enabled').uncheck();
    await page.click('#connect');
    await expect(page.locator('#session-status')).toContainText('Session ready', { timeout: 15_000 });

    await page.fill('#typed-message', 'Say hello in one short sentence.');
    await page.click('#send-text');

    await expect(page.locator('#transcript .message.user')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('#transcript .message.assistant')).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('#usage-log')).toContainText('"stage": "llm"', { timeout: 15_000 });
    await expect(page.locator('#usage-log')).not.toContainText('"stage": "tts"');
  });

  test('push-to-talk enters and exits recording state', async ({ page }) => {
    await signInWithGoogle(page);

    await page.selectOption('#mode', 'PushToTalk');
    await page.click('#connect');
    await expect(page.locator('#session-status')).toContainText('Session ready', { timeout: 15_000 });

    const ptt = page.locator('#ptt');
    await expect(ptt).toBeVisible();
    await expect(ptt).toBeEnabled();

    await ptt.hover();
    await page.mouse.down();
    await expect(ptt).toContainText('Recording', { timeout: 15_000 });
    await page.waitForTimeout(500);
    await page.mouse.up();
    await expect(ptt).toContainText('Hold to talk', { timeout: 15_000 });
  });
});
