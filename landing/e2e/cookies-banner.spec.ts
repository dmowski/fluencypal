import { expect, test, type Page } from '@playwright/test';

const dataLayerCalls = async (page: Page) =>
  page.evaluate(() => {
    const dataLayer = (window as unknown as { dataLayer?: ArrayLike<unknown>[] }).dataLayer || [];
    return dataLayer.map((entry) => Array.from(entry));
  });

test.describe('Cookies banner', () => {
  test('shows on first visit, saves accept, and stays hidden after reload', async ({ page }) => {
    await page.goto('/');

    const banner = page.getByTestId('cookie-banner');
    await expect(banner).toBeVisible();
    await expect(banner.getByRole('link', { name: 'Cookies Policy' })).toHaveAttribute(
      'href',
      '/cookies',
    );

    await expect
      .poll(async () => dataLayerCalls(page), { timeout: 10_000 })
      .toEqual(
        expect.arrayContaining([
          [
            'consent',
            'default',
            expect.objectContaining({
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
            }),
          ],
        ]),
      );

    await page.getByTestId('cookie-banner-accept').click();
    await expect(banner).toHaveCount(0);

    const stored = await page.evaluate(() => window.localStorage.getItem('fp_cookie_consent'));
    expect(stored).toBe('accepted');

    await expect
      .poll(async () => dataLayerCalls(page), { timeout: 10_000 })
      .toEqual(
        expect.arrayContaining([
          [
            'consent',
            'update',
            expect.objectContaining({
              ad_storage: 'granted',
              ad_user_data: 'granted',
              ad_personalization: 'granted',
            }),
          ],
        ]),
      );

    await page.reload();
    await expect(page.getByTestId('cookie-banner')).toHaveCount(0);
    expect(await page.evaluate(() => window.localStorage.getItem('fp_cookie_consent'))).toBe(
      'accepted',
    );
    await expect
      .poll(async () => dataLayerCalls(page), { timeout: 10_000 })
      .toEqual(
        expect.arrayContaining([
          [
            'consent',
            'update',
            expect.objectContaining({
              ad_storage: 'granted',
              ad_user_data: 'granted',
              ad_personalization: 'granted',
            }),
          ],
        ]),
      );
  });

  test('saves decline and does not show again', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('cookie-banner')).toBeVisible();

    await page.getByTestId('cookie-banner-decline').click();
    await expect(page.getByTestId('cookie-banner')).toHaveCount(0);

    const stored = await page.evaluate(() => window.localStorage.getItem('fp_cookie_consent'));
    expect(stored).toBe('declined');

    await expect
      .poll(async () => dataLayerCalls(page), { timeout: 10_000 })
      .toEqual(
        expect.arrayContaining([
          [
            'consent',
            'update',
            expect.objectContaining({
              ad_storage: 'denied',
              ad_user_data: 'denied',
              ad_personalization: 'denied',
            }),
          ],
        ]),
      );
    expect(await dataLayerCalls(page)).not.toEqual(
      expect.arrayContaining([
        [
          'consent',
          'update',
          expect.objectContaining({
            ad_storage: 'granted',
          }),
        ],
      ]),
    );

    await page.reload();
    await expect(page.getByTestId('cookie-banner')).toHaveCount(0);
  });

  test('uses a localized cookies policy link', async ({ page }) => {
    await page.goto('/pl');
    const banner = page.getByTestId('cookie-banner');
    await expect(banner).toBeVisible();
    await expect(banner.getByRole('link', { name: 'Cookies Policy' })).toHaveAttribute(
      'href',
      '/pl/cookies',
    );
  });
});
