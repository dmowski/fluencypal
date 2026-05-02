import { expect, test } from '@playwright/test';

test('opens seeded Gatsby book and shows subtitle and first line', async ({ page }) => {
  await page.goto('/book');

  const title = 'The Great Gatsby';
  const subtitle = 'Then wear the gold hat, if that will move her';
  const firstLinePattern =
    /In my younger and more vulnerable years my father gave me some advice that I['’]ve been turning over in my mind ever since\./;

  const gatsbyCardTitle = page.getByRole('heading', { name: title, level: 4 });
  await expect(gatsbyCardTitle).toBeVisible();

  await gatsbyCardTitle.click();

  await expect(page.getByText(subtitle, { exact: true })).toBeVisible();

  await expect(page.locator('p').filter({ hasText: firstLinePattern }).first()).toBeVisible();
});
