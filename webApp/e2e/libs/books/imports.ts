import { expect, Page } from '@playwright/test';

/**
 * Intercepts /api/convertDocToText and immediately returns an error response.
 * The import flow falls back to the EPUB's own embedded metadata, making tests
 * fast without requiring real AI API calls.
 */
export const mockConvertDocToTextRoute = async (page: Page) => {
  await page.route('**/api/convertDocToText', (route) => {
    void route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'mocked for e2e' }),
    });
  });
};

export const openBooksPageWithCleanStorage = async (page: Page) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    if (typeof indexedDB !== 'undefined') {
      indexedDB.deleteDatabase('readerBooksDb');
    }
  });

  await page.goto('/book');
};

export const openAddBookFileChooser = async (page: Page) => {
  const fileChooserPromise = page.waitForEvent('filechooser');
  await page.getByTestId('add-new-book-card').click();
  return fileChooserPromise;
};

export const importBookFromPicker = async (page: Page, fixturePath: string) => {
  await mockConvertDocToTextRoute(page);
  const fileChooser = await openAddBookFileChooser(page);
  await fileChooser.setFiles(fixturePath);
};

export const expectImportedBookReady = async (page: Page, bookTitle: string) => {
  await expect(page.getByRole('heading', { name: bookTitle, level: 2 })).toBeVisible();
};

export const createFileDropDataTransfer = async ({
  page,
  name,
  type,
  contents,
}: {
  page: Page;
  name: string;
  type: string;
  contents: string | number[];
}) =>
  page.evaluateHandle(
    ({ fileName, mimeType, fileContents }) => {
      const dataTransfer = new DataTransfer();
      const payload = Array.isArray(fileContents) ? new Uint8Array(fileContents) : fileContents;
      const file = new File([payload], fileName, {
        type: mimeType,
      });
      dataTransfer.items.add(file);
      return dataTransfer;
    },
    {
      fileName: name,
      mimeType: type,
      fileContents: contents,
    },
  );

export const dropDataTransferOnBooksList = async (page: Page, dataTransfer: unknown) => {
  const dropTarget = page.getByTestId('books-list-drop-target');
  await dropTarget.dispatchEvent('dragenter', { dataTransfer });
  await dropTarget.dispatchEvent('dragover', { dataTransfer });
  await dropTarget.dispatchEvent('drop', { dataTransfer });
};
