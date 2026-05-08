import { expect, test } from '@playwright/test';
import { openSeededGatsbyBook } from '../libs/books/navigation';

interface ParagraphInvariantReport {
  paragraphIndex: number;
  offsetCount: number;
  duplicates: number[];
  firstNonMonotonicAt: number | null;
  tokenCount: number | null;
  sourceTextLength: number | null;
  tokenMapViolation: string | null;
}

const collectInvariantReports = async (page: import('@playwright/test').Page) =>
  page.evaluate<ParagraphInvariantReport[]>(() => {
    const paragraphRoots = Array.from(
      document.querySelectorAll<HTMLElement>('[data-reader-paragraph-start-offset]'),
    );

    return paragraphRoots.map((root, paragraphIndex) => {
      const charSpans = Array.from(root.querySelectorAll<HTMLElement>('[data-char-offset]'));
      const offsets = charSpans.map((el) => Number(el.getAttribute('data-char-offset')));

      const seen = new Map<number, number>();
      const duplicates: number[] = [];
      offsets.forEach((value) => {
        seen.set(value, (seen.get(value) ?? 0) + 1);
      });
      seen.forEach((count, value) => {
        if (count > 1) {
          duplicates.push(value);
        }
      });

      let firstNonMonotonicAt: number | null = null;
      for (let i = 1; i < offsets.length; i += 1) {
        if (offsets[i] < offsets[i - 1]) {
          firstNonMonotonicAt = i;
          break;
        }
      }

      const tokenCountAttr = root.getAttribute('data-reader-paragraph-token-count');
      const sourceTextLengthAttr = root.getAttribute('data-reader-paragraph-source-text-length');
      const tokenMapViolation = root.getAttribute('data-reader-invariant-violation');

      return {
        paragraphIndex,
        offsetCount: offsets.length,
        duplicates: duplicates.sort((a, b) => a - b),
        firstNonMonotonicAt,
        tokenCount: tokenCountAttr === null ? null : Number(tokenCountAttr),
        sourceTextLength: sourceTextLengthAttr === null ? null : Number(sourceTextLengthAttr),
        tokenMapViolation,
      };
    });
  });

const expectAllParagraphsClean = (reports: ParagraphInvariantReport[]) => {
  expect(reports.length).toBeGreaterThan(0);
  const violations = reports.filter(
    (report) =>
      report.duplicates.length > 0 ||
      report.firstNonMonotonicAt !== null ||
      report.tokenMapViolation !== null ||
      report.tokenCount === null ||
      report.sourceTextLength === null ||
      (report.tokenCount !== null && report.tokenCount <= 0),
  );
  expect(violations, JSON.stringify(violations, null, 2)).toEqual([]);
};

test.describe('reader token-map invariants', () => {
  test('every visible paragraph has unique and monotonic data-char-offset values', async ({
    page,
  }) => {
    await openSeededGatsbyBook(page);

    const initialReports = await collectInvariantReports(page);
    expectAllParagraphsClean(initialReports);

    for (let step = 0; step < 5; step += 1) {
      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(150);
      const reports = await collectInvariantReports(page);
      expectAllParagraphsClean(reports);
    }
  });
});
