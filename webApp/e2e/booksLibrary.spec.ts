import { expect, test } from '@playwright/test';
import { openBooksPageWithCleanStorage } from './books.helpers';

const GUTENBERG_ROMANCE_BOOK_ID = '1342';
const GUTENBERG_ROMANCE_TITLE = 'Pride and Prejudice';

test('shows live Gutenberg library categories on books home page', async ({ page }) => {
  test.setTimeout(120_000);

  await openBooksPageWithCleanStorage(page);

  await expect(page.getByRole('heading', { name: 'Library', level: 4 })).toBeVisible();

  const romanceCategory = page.getByTestId('reader-library-category-romance');
  await expect(romanceCategory).toBeVisible({ timeout: 60_000 });

  await expect
    .poll(async () => romanceCategory.locator('[data-testid^="reader-library-book-"]').count())
    .toBeGreaterThan(0);

  const romanceBook = page.getByTestId(`reader-library-book-${GUTENBERG_ROMANCE_BOOK_ID}`);
  await expect(romanceBook).toContainText(GUTENBERG_ROMANCE_TITLE);
  await expect(romanceBook.locator('img')).toBeVisible();
});

test('downloads a live Gutenberg EPUB and opens it in the reader', async ({ page }) => {
  test.setTimeout(240_000);

  await openBooksPageWithCleanStorage(page);

  const gutenbergBookCard = page.getByTestId(`reader-library-book-${GUTENBERG_ROMANCE_BOOK_ID}`);
  await expect(gutenbergBookCard).toBeVisible({ timeout: 60_000 });

  await gutenbergBookCard.click();

  await expect(page.getByTestId('library-download-fixed-panel')).toBeVisible();

  await expect(page.getByRole('heading', { name: GUTENBERG_ROMANCE_TITLE, level: 2 })).toBeVisible({
    timeout: 180_000,
  });
  await page.getByRole('button', { name: 'Read' }).click();
  await expect(page.getByRole('button', { name: 'Book info' })).toBeVisible();
  await expect(page.getByTestId('reader-page-indicator')).toBeVisible();

  const readerContent = page.getByTestId('reader-content');
  const titleLabel = readerContent.locator('strong').filter({ hasText: 'Title' }).first();

  for (let step = 0; step < 8; step += 1) {
    if (await titleLabel.count()) {
      break;
    }

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(120);
  }

  await expect(titleLabel).toBeVisible();
  await expect(readerContent).toContainText('Pride and Prejudice');
  await expect(readerContent.getByText('**Title**', { exact: false })).toHaveCount(0);

  const storedTitles = await page.evaluate(async () => {
    const openDb = (): Promise<IDBDatabase> =>
      new Promise((resolve, reject) => {
        const request = window.indexedDB.open('readerBooksDb', 1);
        request.onerror = () => reject(request.error ?? new Error('Failed to open IndexedDB'));
        request.onsuccess = () => resolve(request.result);
      });

    const db = await openDb();

    const books: unknown[] = await new Promise((resolve, reject) => {
      const transaction = db.transaction('readerMeta', 'readonly');
      const store = transaction.objectStore('readerMeta');
      const request = store.getAll();

      request.onerror = () => reject(request.error ?? new Error('Failed to read books from DB'));
      request.onsuccess = () => resolve(Array.isArray(request.result) ? request.result : []);
    });

    db.close();

    return books
      .map((book) => (book && typeof book === 'object' ? (book as { title?: string }).title : ''))
      .filter((title): title is string => Boolean(title));
  });

  expect(storedTitles).toContain(GUTENBERG_ROMANCE_TITLE);
});
