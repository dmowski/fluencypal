import { expect, test } from '@playwright/test';

test.describe('Cookies banner', () => {
  test('shows on first visit, saves accept, and stays hidden after reload', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('fp_cookie_consent');
    });

    await page.goto('/');

    const banner = page.getByTestId('cookie-banner');
    await expect(banner).toBeVisible();
    await expect(banner.getByRole('link', { name: 'Cookies Policy' })).toHaveAttribute(
      'href',
      '/cookies',
    );

    await page.getByTestId('cookie-banner-accept').click();
    await expect(banner).toHaveCount(0);

    const stored = await page.evaluate(() => window.localStorage.getItem('fp_cookie_consent'));
    expect(stored).toBe('accepted');

    await page.reload();
    await expect(page.getByTestId('cookie-banner')).toHaveCount(0);
  });

  test('saves decline and does not show again', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('fp_cookie_consent');
    });

    await page.goto('/');
    await expect(page.getByTestId('cookie-banner')).toBeVisible();

    await page.getByTestId('cookie-banner-decline').click();
    await expect(page.getByTestId('cookie-banner')).toHaveCount(0);

    const stored = await page.evaluate(() => window.localStorage.getItem('fp_cookie_consent'));
    expect(stored).toBe('declined');

    await page.reload();
    await expect(page.getByTestId('cookie-banner')).toHaveCount(0);
  });

  test('uses a localized cookies policy link', async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.removeItem('fp_cookie_consent');
    });

    await page.goto('/pl');
    const banner = page.getByTestId('cookie-banner');
    await expect(banner).toBeVisible();
    await expect(banner.getByRole('link', { name: 'Cookies Policy' })).toHaveAttribute(
      'href',
      '/pl/cookies',
    );
  });
});
