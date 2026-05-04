import { Page } from '@playwright/test';

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
  const fileChooser = await openAddBookFileChooser(page);
  await fileChooser.setFiles(fixturePath);
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
