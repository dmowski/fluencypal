import { expect, test } from '@playwright/test';
import { ensureReaderTextVisible } from './books.helpers';

const BOOK_FIXTURE_PATH = 'e2e/fixtures/Supercommunicators.epub';
const EXPECTED_COPYRIGHT = 'Copyright © 2024 by Charles Duhigg';
const EXPECTED_COVER_SRC = '../images/9780385697750_cover.jpg';

test('imports EPUB with images and opens reader with parsed content', async ({ page }) => {
  test.setTimeout(180_000);

  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    if (typeof indexedDB !== 'undefined') {
      indexedDB.deleteDatabase('readerBooksDb');
    }
  });

  await page.goto('/book');

  await page.getByText('Add New Book', { exact: true }).first().click();
  const addBookModal = page
    .getByRole('heading', { name: 'Add New Book' })
    .locator('..')
    .locator('..');
  await expect(page.getByRole('heading', { name: 'Add New Book' })).toBeVisible();

  const epubInput = addBookModal.locator('input[type="file"][accept*=".epub"]');
  await epubInput.setInputFiles(BOOK_FIXTURE_PATH);

  const titleInput = addBookModal.getByRole('textbox', { name: 'Title', exact: true });
  const subtitleInput = addBookModal.getByRole('textbox', { name: 'Subtitle', exact: true });
  const authorInput = addBookModal.getByRole('textbox', { name: 'Author', exact: true });
  const textInput = addBookModal.getByRole('textbox', { name: 'Text', exact: true });

  await expect.poll(async () => (await titleInput.inputValue()).trim()).not.toBe('');
  await expect.poll(async () => (await subtitleInput.inputValue()).trim()).not.toBe('');
  await expect.poll(async () => (await authorInput.inputValue()).trim()).not.toBe('');
  await expect.poll(async () => (await textInput.inputValue()).trim().length).toBeGreaterThan(200);

  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Add New Book' })).not.toBeVisible();

  await expect(page.getByRole('heading', { name: 'Supercommunicators', level: 2 })).toBeVisible();

  await ensureReaderTextVisible(page, EXPECTED_COPYRIGHT, { maxSteps: 30 });
  await expect
    .poll(async () => (await page.locator('body').innerText()).includes(EXPECTED_COPYRIGHT))
    .toBeTruthy();

  const coverImage = page.locator('img[alt*="Cover"]').first();
  await expect(coverImage).toBeVisible();
  await expect(coverImage).toHaveAttribute('src', EXPECTED_COVER_SRC);
});
