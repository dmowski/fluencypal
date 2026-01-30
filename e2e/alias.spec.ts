import { test, expect } from '@playwright/test';

test.describe('Alias Game', () => {
  test('Render Alias Game page', async ({ page }) => {
    await page.goto('/alias');

    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('en');
  });
});
