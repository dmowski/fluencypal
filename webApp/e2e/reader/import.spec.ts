import { expect, test, Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import {
  createFileDropDataTransfer,
  dropDataTransferOnBooksList,
  ensureReaderTextVisible,
  importBookFromPicker,
  openAddBookFileChooser,
  openBooksPageWithCleanStorage,
} from '../libs/reader';

const BOOK_FIXTURE_PATH = 'e2e/fixtures/Supercommunicators.epub';
const EXPECTED_COPYRIGHT = 'Copyright © 2024 by Charles Duhigg';
const EXPECTED_COVER_IMAGE_KEY = 'images/9780385697750_cover.jpg';

const assertVisibleReaderColumnsFitViewport = async (page: Page) => {
  const columns = page.getByTestId('reader-page-column');
  const count = await columns.count();
  expect(count).toBeGreaterThan(0);

  for (let index = 0; index < count; index += 1) {
    const metrics = await columns.nth(index).evaluate((element) => {
      const node = element as HTMLElement;
      return {
        clientWidth: node.clientWidth,
        scrollWidth: node.scrollWidth,
        clientHeight: node.clientHeight,
        scrollHeight: node.scrollHeight,
      };
    });

    expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth + 2);
    expect(metrics.scrollHeight).toBeLessThanOrEqual(metrics.clientHeight + 2);
  }
};

const findVisibleRenderedImage = async (page: Page): Promise<boolean> => {
  const renderedImage = page.locator('img[src^="data:image/"]').first();
  if (await renderedImage.count()) {
    if (await renderedImage.isVisible()) {
      return true;
    }
  }

  return false;
};

test('imports EPUB with images and opens reader with parsed content', async ({ page }) => {
  test.setTimeout(180_000);

  await openBooksPageWithCleanStorage(page);
  await importBookFromPicker(page, BOOK_FIXTURE_PATH);

  await expect(page.getByRole('heading', { name: 'Supercommunicators', level: 2 })).toBeVisible();

  await ensureReaderTextVisible(page, EXPECTED_COPYRIGHT, { maxSteps: 30 });
  await expect
    .poll(async () => (await page.locator('body').innerText()).includes(EXPECTED_COPYRIGHT))
    .toBeTruthy();

  let hasRenderedDataImage = await findVisibleRenderedImage(page);
  for (let step = 0; step < 8 && !hasRenderedDataImage; step += 1) {
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(120);
    hasRenderedDataImage = await findVisibleRenderedImage(page);
  }
  expect(hasRenderedDataImage).toBeTruthy();

  for (let step = 0; step < 8; step += 1) {
    await assertVisibleReaderColumnsFitViewport(page);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(120);
  }

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
    }) as
      | {
          imagesByHref?: Record<string, string>;
          imageAspectRatioByHref?: Record<string, number>;
        }
      | undefined;

    const imagesByHref = savedBook?.imagesByHref ?? {};
    const imageAspectRatioByHref = savedBook?.imageAspectRatioByHref ?? {};
    const coverSrc = imagesByHref[expectedImageKey] ?? '';
    const coverAspectRatio = imageAspectRatioByHref[expectedImageKey] ?? 0;

    return {
      imageCount: Object.keys(imagesByHref).length,
      aspectRatioCount: Object.keys(imageAspectRatioByHref).length,
      hasCoverImageKey: Boolean(imagesByHref[expectedImageKey]),
      coverSrc,
      coverAspectRatio,
    };
  }, EXPECTED_COVER_IMAGE_KEY);

  expect(imageMapState.imageCount).toBeGreaterThan(0);
  expect(imageMapState.aspectRatioCount).toBeGreaterThan(0);
  expect(imageMapState.hasCoverImageKey).toBeTruthy();
  expect(imageMapState.coverSrc).toMatch(/^data:image\/[a-zA-Z0-9.+-]+;base64,/);
  expect(imageMapState.coverAspectRatio).toBeGreaterThan(0);
});

test('imports book by dropping EPUB on books page', async ({ page }) => {
  test.setTimeout(180_000);

  await openBooksPageWithCleanStorage(page);

  const fixturePath = path.resolve(process.cwd(), BOOK_FIXTURE_PATH);
  const epubBytes = Array.from(await readFile(fixturePath));

  const dataTransfer = await createFileDropDataTransfer({
    page,
    name: 'Supercommunicators.epub',
    type: 'application/epub+zip',
    contents: epubBytes,
  });

  await dropDataTransferOnBooksList(page, dataTransfer);

  await expect(page.getByRole('heading', { name: 'Supercommunicators', level: 2 })).toBeVisible({
    timeout: 60_000,
  });
  await ensureReaderTextVisible(page, EXPECTED_COPYRIGHT, {
    maxSteps: 12,
  });
});

test('shows validation error when unsupported file is selected in Add Book picker', async ({
  page,
}) => {
  await openBooksPageWithCleanStorage(page);

  const fileChooser = await openAddBookFileChooser(page);
  await fileChooser.setFiles({
    name: 'invalid.mp4',
    mimeType: 'video/mp4',
    buffer: Buffer.from('video mock payload', 'utf8'),
  });

  await expect(page.getByTestId('books-drop-import-error')).toHaveText(
    'Please select a valid EPUB file.',
  );
});
