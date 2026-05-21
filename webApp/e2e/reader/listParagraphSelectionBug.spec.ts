import { expect, test } from '@playwright/test';
import {
  importBookFromPicker,
  expectImportedBookReady,
  openBooksPageWithCleanStorage,
} from '../libs/reader';
import { ensureReaderTextVisible } from '../libs/books/navigation';

const BOOK_FIXTURE_PATH = 'e2e/fixtures/Supercommunicators.epub';

/**
 * Regression for the reported bug: in the Supercommunicators bullet-list
 * paragraph that starts with "**Finally, experiment.** Tell a joke. Ask an
 * unexpected question. …" clicking the word "Tell" used to highlight "expe"
 * (offsets ~13–17) instead of "Tell" (offsets 27–30) because the renderer's
 * wordIndex drifted by +1 against `renderableTokens[]` in
 * `ReaderParagraph.tsx`.
 *
 * The test loads the real book, scrolls to the paragraph, and uses the
 * `window.__reader__` debug bridge to assert per-visible-token source ranges,
 * then clicks "Tell" and verifies the resulting selection (read back from the
 * same bridge) covers exactly "Tell".
 */

const PARAGRAPH_TEXT_FRAGMENT = 'Finally, experiment.';
const VISIBLE_TOKEN_EXPECTATIONS: Array<{ text: string; expectedStart: number }> = [
  // Source-text positions inside `- **Finally, experiment.** Tell a joke. Ask …`
  { text: 'Finally,', expectedStart: 4 },
  { text: 'experiment.', expectedStart: 13 },
  { text: 'Tell', expectedStart: 27 },
  { text: 'a', expectedStart: 32 },
  { text: 'joke.', expectedStart: 34 },
  { text: 'Ask', expectedStart: 40 },
];

interface BridgeTokenSnapshot {
  kind: string | null;
  text: string;
  sourceStart: number | null;
  sourceEndExclusive: number | null;
  wordSourceIndex: number | null;
}

interface BridgeParagraphSnapshot {
  paragraphIndex: number;
  text: string;
  tokens: BridgeTokenSnapshot[];
}

test.describe('reader li paragraph – Tell-selection regression (real Supercommunicators)', () => {
  test('every visible word in the "Finally, experiment." paragraph maps to the correct source position', async ({
    page,
  }) => {
    test.setTimeout(240_000);

    await openBooksPageWithCleanStorage(page);
    await importBookFromPicker(page, BOOK_FIXTURE_PATH);

    await expectImportedBookReady(page, 'Supercommunicators');

    await ensureReaderTextVisible(page, PARAGRAPH_TEXT_FRAGMENT, { maxSteps: 240 });

    // Wait for the debug bridge to be installed.
    await page.waitForFunction(
      () => typeof (window as unknown as { __reader__?: object }).__reader__ !== 'undefined',
      undefined,
      { timeout: 15_000 },
    );

    const targetParagraph = await page.evaluate((fragment) => {
      const bridge = (
        window as unknown as {
          __reader__?: {
            dumpAllParagraphs: () => Array<{
              paragraphIndex: number;
              text: string;
              tokens: Array<{
                kind: string | null;
                text: string;
                sourceStart: number | null;
                sourceEndExclusive: number | null;
                wordSourceIndex: number | null;
              }>;
            }>;
          };
        }
      ).__reader__;
      if (!bridge) return null;
      const snapshots = bridge.dumpAllParagraphs();
      const match = snapshots.find((entry) => entry.text.includes(fragment));
      return match ?? null;
    }, PARAGRAPH_TEXT_FRAGMENT);

    expect(
      targetParagraph,
      `paragraph containing "${PARAGRAPH_TEXT_FRAGMENT}" not found by debug bridge`,
    ).not.toBeNull();

    const snapshot = targetParagraph as BridgeParagraphSnapshot;

    for (const { text, expectedStart } of VISIBLE_TOKEN_EXPECTATIONS) {
      const match = snapshot.tokens.find((token) => token.text.trim() === text);
      expect(match, `token "${text}" not found in paragraph snapshot`).toBeTruthy();
      expect(
        match!.sourceStart,
        `token "${text}" reports the wrong sourceStart (off-by-+1 means renderer's wordIndex consumed the next token's range)`,
      ).toBe(expectedStart);
    }
  });

  test('clicking "Tell" highlights "Tell" (not "expe")', async ({ page }) => {
    test.setTimeout(240_000);

    await openBooksPageWithCleanStorage(page);
    await importBookFromPicker(page, BOOK_FIXTURE_PATH);

    await expectImportedBookReady(page, 'Supercommunicators');

    await ensureReaderTextVisible(page, PARAGRAPH_TEXT_FRAGMENT, { maxSteps: 240 });

    // Find the actual word-anchor element for "Tell" inside the bullet
    // paragraph (filter to the right paragraph by its leading fragment).
    const tellLocator = page
      .locator('[data-reader-paragraph-start-offset]')
      .filter({ hasText: PARAGRAPH_TEXT_FRAGMENT })
      .first()
      .locator('[data-reader-word-anchor="true"]')
      .filter({ hasText: /^Tell$/ })
      .first();

    await expect(tellLocator).toBeVisible();

    const reportedSourceStart = await tellLocator.getAttribute('data-reader-token-source-start');
    expect(
      reportedSourceStart,
      'Tell\'s data-reader-token-source-start should be 27; 13 would mean the renderer matched it to "experiment." (the bug → "expe" highlight)',
    ).toBe('27');

    await tellLocator.click();

    const selection = await page.evaluate(() => {
      const bridge = (
        window as unknown as {
          __reader__?: { getCurrentSelection: () => { text: string } };
        }
      ).__reader__;
      return bridge?.getCurrentSelection() ?? null;
    });

    expect(selection, 'reader debug bridge did not return a selection').not.toBeNull();
    expect(selection!.text.trim()).toBe('Tell');
  });
});
