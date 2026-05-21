import { expect, test } from '@playwright/test';
import { openSeededGatsbyBook, pressReaderNextPage } from '../libs/books/navigation';

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
      await pressReaderNextPage(page);
      const reports = await collectInvariantReports(page);
      expectAllParagraphsClean(reports);
    }
  });

  test('em-dash words are split into separate tokens (no mid-word em-dash)', async ({ page }) => {
    await openSeededGatsbyBook(page);

    // Collect word spans across several pages until we find the em-dash text.
    // The Gatsby test data contains cases like "reaction—Gatsby", "No—Gatsby", "universe—so", etc.
    const badWordsFoundAcrossPages: string[] = [];
    let foundEmDashRegion = false;

    for (let step = 0; step < 30; step += 1) {
      const result = await page.evaluate(() => {
        const wordSpans = Array.from(document.querySelectorAll<HTMLElement>('[data-word-index]'));
        const texts = wordSpans.map((el) => el.textContent ?? '');
        // A word is bad if it has an em-dash followed by a non-whitespace character
        // in the middle (e.g. "reaction—Gatsby"). Trailing em-dashes like "reaction—" are fine.
        const badWords = texts.filter((t) => /—[^\s]/.test(t));
        const hasEmDashWord = texts.some((t) => t.includes('—'));
        return { badWords, hasEmDashWord };
      });

      badWordsFoundAcrossPages.push(...result.badWords);
      if (result.hasEmDashWord) {
        foundEmDashRegion = true;
      }

      if (foundEmDashRegion && step >= 5) {
        break;
      }
      await pressReaderNextPage(page);
    }

    expect(
      badWordsFoundAcrossPages,
      `These word spans contain a mid-word em-dash (should have been split): ${JSON.stringify(badWordsFoundAcrossPages)}`,
    ).toEqual([]);
    expect(foundEmDashRegion, 'Expected to find at least one page with em-dash words').toBe(true);
  });
});
