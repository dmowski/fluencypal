import type { Page } from '@playwright/test';

/**
 * Stub Telegram from the browser (client `/api/telegram` and direct api.telegram.org).
 * Server-side sends are blocked separately via E2E_DISABLE_TELEGRAM on the dev server.
 */
export const mockTelegramHttp = async (page: Page): Promise<void> => {
  await page.route('https://api.telegram.org/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, result: { message_id: 1 } }),
    });
  });

  await page.route('**/api/telegram**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ error: '' }),
    });
  });
};
