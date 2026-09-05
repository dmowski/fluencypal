import { expect, test } from '@playwright/test';

test.describe('Interview phrases blog CTA', () => {
  test('shows a direct practice link after the article', async ({ page }) => {
    await page.goto('/blog/phrases-for-an-interview-in-english');

    const cta = page.locator('#blog-interview-cta');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute(
      'href',
      'https://app.fluencypal.com/practice?rolePlayId=job-interview',
    );
  });

  test('keeps the same app href on the Arabic article', async ({ page }) => {
    await page.goto('/ar/blog/phrases-for-an-interview-in-english');

    const cta = page.locator('#blog-interview-cta');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute(
      'href',
      'https://app.fluencypal.com/ar/practice?rolePlayId=job-interview',
    );
  });

  test('does not show the interview CTA on unrelated posts', async ({ page }) => {
    await page.goto('/blog/present-perfect-vs-past-simple');

    await expect(page.locator('#blog-interview-cta')).toHaveCount(0);
  });
});
