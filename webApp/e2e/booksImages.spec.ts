import { expect, test } from '@playwright/test';
import { ensureReaderTextVisible } from './books.helpers';

const BOOK_FIXTURE_PATH = 'e2e/fixtures/Supercommunicators.epub';
const EXPECTED_COPYRIGHT = 'Copyright © 2024 by Charles Duhigg';
const EXPECTED_COVER_IMAGE_KEY = 'images/9780385697750_cover.jpg';

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

  const extractedImages = addBookModal.getByTestId('epub-extracted-image');
  await expect(extractedImages.first()).toBeVisible();
  await expect.poll(async () => extractedImages.count()).toBeGreaterThan(0);
  await expect(extractedImages.first()).toHaveAttribute(
    'src',
    /^data:image\/[a-zA-Z0-9.+-]+;base64,/,
  );

  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Add New Book' })).not.toBeVisible();

  await expect(page.getByRole('heading', { name: 'Supercommunicators', level: 2 })).toBeVisible();

  await ensureReaderTextVisible(page, EXPECTED_COPYRIGHT, { maxSteps: 30 });
  await expect
    .poll(async () => (await page.locator('body').innerText()).includes(EXPECTED_COPYRIGHT))
    .toBeTruthy();

  const coverImage = page.locator('img[alt*="Cover"]').first();
  await expect(coverImage).toBeVisible();
  await expect(coverImage).toHaveAttribute('src', /^data:image\/[a-zA-Z0-9.+-]+;base64,/);

  const imageMapState = await page.evaluate(async (expectedImageKey) => {
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

    const savedBook = books.find((book) => {
      if (!book || typeof book !== 'object') return false;
      return (book as { title?: string }).title === 'Supercommunicators';
    }) as { imagesByHref?: Record<string, string> } | undefined;

    const imagesByHref = savedBook?.imagesByHref ?? {};
    const coverSrc = imagesByHref[expectedImageKey] ?? '';

    return {
      imageCount: Object.keys(imagesByHref).length,
      hasCoverImageKey: Boolean(imagesByHref[expectedImageKey]),
      coverSrc,
    };
  }, EXPECTED_COVER_IMAGE_KEY);

  expect(imageMapState.imageCount).toBeGreaterThan(0);
  expect(imageMapState.hasCoverImageKey).toBeTruthy();
  expect(imageMapState.coverSrc).toMatch(/^data:image\/[a-zA-Z0-9.+-]+;base64,/);
});
