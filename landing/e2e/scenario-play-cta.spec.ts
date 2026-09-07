import { expect, test } from '@playwright/test';

test.describe('Scenario play CTA', () => {
  test('shows a direct practice link after the article', async ({ page }) => {
    await page.goto('/scenarios/job-interview');

    const cta = page.locator('#scenario-play-cta');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute(
      'href',
      'https://app.fluencypal.com/practice?rolePlayId=job-interview',
    );

    await expect(page.locator('#scenario-hero-cta')).toHaveAttribute(
      'href',
      'https://app.fluencypal.com/practice?rolePlayId=job-interview',
    );
    await expect(page.locator('#scenario-footer-cta')).toHaveAttribute(
      'href',
      'https://app.fluencypal.com/practice?rolePlayId=job-interview',
    );
  });

  test('keeps the localized app href on a translated scenario', async ({ page }) => {
    await page.goto('/zh/scenarios/job-interview');

    const cta = page.locator('#scenario-play-cta');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute(
      'href',
      'https://app.fluencypal.com/zh/practice?rolePlayId=job-interview',
    );
  });

  test('does not show the article CTA on the Alias landing', async ({ page }) => {
    await page.goto('/scenarios/alias-game');

    await expect(page.locator('#scenario-play-cta')).toHaveCount(0);
  });
});
