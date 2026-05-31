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

  test('New blog post opens the editor modal immediately without hanging', async ({ page }) => {
    await signInAsAdmin(page);

    await page.getByRole('button', { name: 'Blog' }).click();
    await expect(page.getByRole('button', { name: 'New Blog Post' })).toBeVisible();

    await page.getByRole('button', { name: 'New Blog Post' }).click();

    // The editor modal should open immediately — before the Firestore
    // real-time listener delivers the new document.
    await expect(page.getByText('Untitled Blog Post')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save Draft' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible();
  });

  test('New blog post appears in the list after closing the editor', async ({ page }) => {
    await signInAsAdmin(page);

    await page.getByRole('button', { name: 'Blog' }).click();

    await page.getByRole('button', { name: 'New Blog Post' }).click();

    // Wait for the editor to be open.
    await expect(page.getByRole('button', { name: 'Save Draft' })).toBeVisible();

    // Close the modal with the X button.
    await page.getByRole('button', { name: 'close' }).click();

    // The new blog should now appear in the list as a Draft.
    await expect(page.getByText('Draft').first()).toBeVisible();
  });

  test('Editor language selector defaults to English', async ({ page }) => {
    await signInAsAdmin(page);

    await page.getByRole('button', { name: 'Blog' }).click();

    await page.getByRole('button', { name: 'New Blog Post' }).click();

    await expect(page.getByRole('button', { name: 'Save Draft' })).toBeVisible();

    // The language selector should default to English.
    // MUI Select renders as a button, check its visible text content.
    await expect(page.getByRole('combobox').first()).toContainText('English');
  });

  test('Can save draft content', async ({ page }) => {
    await signInAsAdmin(page);

    await page.getByRole('button', { name: 'Blog' }).click();

    await page.getByRole('button', { name: 'New Blog Post' }).click();

    await expect(page.getByRole('button', { name: 'Save Draft' })).toBeVisible();

    // Fill in the English title.
    const titleField = page.getByRole('textbox', { name: 'Title (en)', exact: true });
    await titleField.fill('My First Blog Post');

    // Save the draft.
    await page.getByRole('button', { name: 'Save Draft' }).click();

    // The button should briefly show "Saving..." and then return to normal.
    await expect(page.getByRole('button', { name: 'Save Draft' })).toBeVisible();

    // The header title should update to match what was typed.
    await expect(page.getByText('My First Blog Post').first()).toBeVisible();
  });

  test('Saved title appears in the blog list after closing editor', async ({ page }) => {
    await signInAsAdmin(page);

    await page.getByRole('button', { name: 'Blog' }).click();
    await page.getByRole('button', { name: 'New Blog Post' }).click();

    await expect(page.getByRole('button', { name: 'Save Draft' })).toBeVisible();

    const titleField = page.getByRole('textbox', { name: 'Title (en)', exact: true });
    await titleField.fill('My Titled Post');

    await page.getByRole('button', { name: 'Save Draft' }).click();
    await expect(page.getByRole('button', { name: 'Save Draft' })).toBeVisible();

    // Close the modal.
    await page.getByRole('button', { name: 'close' }).click();

    // The list should show the saved English title, not "Untitled".
    await expect(page.getByText('My Titled Post')).toBeVisible();
  });

  test('Can delete a blog post from the list', async ({ page }) => {
    await signInAsAdmin(page);

    await page.getByRole('button', { name: 'Blog' }).click();
    await page.getByRole('button', { name: 'New Blog Post' }).click();

    await expect(page.getByRole('button', { name: 'Save Draft' })).toBeVisible();

    // Close the editor.
    await page.getByRole('button', { name: 'close' }).click();

    // The draft should appear in the list.
    await expect(page.getByText('Draft').first()).toBeVisible();

    // Delete it.
    await page.getByRole('button', { name: 'Delete blog post' }).click();

    // The list should return to empty state.
    await expect(page.getByText('No blog posts yet.')).toBeVisible();
  });
});
