import { expect, test } from '@playwright/test';
import { resetEmulatorState } from '../libs/books/auth';
import { signInAsAdmin } from '../libs/blog/auth';

test.describe('Blog admin', () => {
  test.beforeEach(async () => {
    await resetEmulatorState();
  });

  test('Blog tab is visible and shows empty state for admin user', async ({ page }) => {
    await signInAsAdmin(page);

    await page.getByRole('button', { name: 'Blog' }).click();

    await expect(page.getByRole('heading', { name: 'Blog Posts' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'New Blog Post' })).toBeVisible();
    await expect(page.getByText('No blog posts yet.')).toBeVisible();
  });
});
