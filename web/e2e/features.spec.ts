import { expect, test } from '@playwright/test';

test.describe('Features pages', () => {
  test('should render features index and expose detail links', async ({ page }) => {
    await page.goto('/features');

    await expect(page.getByRole('heading', { name: 'FluencyPal Features' })).toBeVisible();

    const detailLink = page.locator('a[href="/features/learning-plan"]');
    await expect(detailLink).toBeVisible();
  });

  test('should render localized feature page with localized navigation links', async ({ page }) => {
    await page.goto('/ru/features/learning-plan');

    const htmlLang = await page.locator('html').getAttribute('lang');
    expect(htmlLang).toBe('ru');

    await expect(
      page.getByRole('heading', { name: 'Personalized Learning Plan for English Practice' }),
    ).toBeVisible();

    await expect(page.getByRole('link', { name: 'View all features' })).toHaveAttribute(
      'href',
      '/ru/features',
    );
  });
});
