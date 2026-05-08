import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { expect, test, Page } from '@playwright/test';

const BOOKS = [
  { id: 'pride-and-prejudice' },
  { id: 'supercommunicators' },
  { id: 'ziarno-prawdy' },
  { id: 'secret-of-chimneys' },
] as const;

const EXPECTED_PREFIX_LENGTH = 20000;
const AUTO_UPDATE_SNAPSHOTS = process.env.EPUB_MD_UPDATE_SNAPSHOTS === '1';

const getMarkdownBody = (output: string): string => {
  const firstBlankLine = output.indexOf('\n\n');
  if (firstBlankLine === -1) {
    return output;
  }

  return output.slice(firstBlankLine + 2);
};

const parseAndReadOutput = async (bookId: string, page: Page) => {
  const parseButton = page.getByTestId(`epub-import-parse-${bookId}`);
  const outputArea = page.getByTestId(`epub-import-output-${bookId}`);
  const errorMessage = page.getByTestId(`epub-import-error-${bookId}`);

  await parseButton.click();

  await expect
    .poll(async () => (await outputArea.inputValue()).length, { timeout: 180_000 })
    .toBeGreaterThan(0);

  await expect(parseButton).toHaveText('Parse');
  await expect(parseButton).toBeEnabled();
  await expect(errorMessage).toHaveCount(0);

  return (await outputArea.inputValue()).replace(/\r\n/g, '\n');
};

test.describe('books epub to markdown', () => {
  for (const book of BOOKS) {
    test(`parses ${book.id} and matches first ${EXPECTED_PREFIX_LENGTH} symbols`, async ({
      page,
    }, testInfo) => {
      test.setTimeout(240_000);

      await page.goto('/book/test/epubImport');
      await expect(page.getByTestId('epub-import-test-page')).toBeVisible();

      const output = await parseAndReadOutput(book.id, page);
      const markdownBody = getMarkdownBody(output);
      const markdownPrefix = markdownBody.slice(0, EXPECTED_PREFIX_LENGTH);
      const snapshotName = `${book.id}.snapshot.txt`;

      if (AUTO_UPDATE_SNAPSHOTS) {
        const snapshotPath = testInfo.snapshotPath(snapshotName);
        await mkdir(dirname(snapshotPath), { recursive: true });
        await writeFile(snapshotPath, markdownPrefix, 'utf8');
      }

      expect(markdownPrefix).toMatchSnapshot(snapshotName);
    });
  }
});
