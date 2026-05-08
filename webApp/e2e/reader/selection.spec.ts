import { expect, test } from '@playwright/test';
import {
  assertCurrentSelectionText,
  assertHighlightPopoverHidden,
  assertHighlightPopoverVisible,
  assertSelectionTextPersists,
  clickCriticizingWord,
  ensureReaderTextVisible,
  installSpeechMock,
  openSeededGatsbyBook,
  selectCriticizingWordText,
  selectEverInsideNeverFoundPhrase,
  selectFirstParagraphRangeByWordBoundaries,
  selectStoodInsideUnderstood,
  selectWheneverYouFeelPartialText,
  BOOK_SUBTITLE,
} from '../libs/reader';

test('selected text keeps selection visible when highlight popover opens', async ({ page }) => {
  await openSeededGatsbyBook(page);

  await selectCriticizingWordText(page);

  await assertHighlightPopoverVisible(page);
  await assertCurrentSelectionText(page, /criticizing/i);
});

test('re-clicking selected word clears both popup and browser selection', async ({ page }) => {
  await openSeededGatsbyBook(page);

  await clickCriticizingWord(page);
  await assertHighlightPopoverVisible(page);
  await assertCurrentSelectionText(page, /criticizing/i);

  // Second click on the same word — popup should close and selection should be cleared.
  await clickCriticizingWord(page);
  await assertHighlightPopoverHidden(page);

  const selectionAfter = await page.evaluate(() => window.getSelection()?.toString().trim() ?? '');
  expect(selectionAfter).toBe('');
});

test('partial selection does not shift text around younger/vulnerable phrase', async ({ page }) => {
  await openSeededGatsbyBook(page);

  // Select from "o" in "younger" (offset 1 in word) to after "b" in "vulnerable" (offset 8).
  await selectFirstParagraphRangeByWordBoundaries(page, 2, 1, 5, 8);

  await assertHighlightPopoverVisible(page);
  await assertCurrentSelectionText(page, /^ounger and more vulnerab$/i);
  await assertSelectionTextPersists(page, /^ounger and more vulnerab$/i);
});

test('partial selection does not collapse for whenever/feel phrase', async ({ page }) => {
  await openSeededGatsbyBook(page);

  await selectWheneverYouFeelPartialText(page);

  await assertHighlightPopoverVisible(page);
  await assertCurrentSelectionText(page, /^henever you fee$/i);
  await assertSelectionTextPersists(page, /^henever you fee$/i);
});

test('selecting ever in "I have never found" stays on intended ever', async ({ page }) => {
  await openSeededGatsbyBook(page);

  await ensureReaderTextVisible(page, 'I have never found in any other person');

  await selectEverInsideNeverFoundPhrase(page);

  await assertHighlightPopoverVisible(page);
  await assertCurrentSelectionText(page, /^ever$/i);
  await assertSelectionTextPersists(page, /^ever$/i);
});

test('selecting stood in understood keeps partial selection only', async ({ page }) => {
  await openSeededGatsbyBook(page);

  await selectStoodInsideUnderstood(page);

  await assertHighlightPopoverVisible(page);
  await assertCurrentSelectionText(page, /^stood$/i);
  await assertSelectionTextPersists(page, /^stood$/i);
});

test('Ctrl+A selects only page content without triggering highlight popover or voiceover', async ({
  page,
}) => {
  await installSpeechMock(page);
  await openSeededGatsbyBook(page);

  await page.keyboard.press('Control+a');

  // Selection must be non-empty
  const selectedText = await page.evaluate(() => window.getSelection()?.toString().trim() ?? '');
  expect(selectedText.length).toBeGreaterThan(0);

  // Selected text must not include the header subtitle (which lives outside page columns)
  expect(selectedText).not.toContain(BOOK_SUBTITLE);

  // Highlight popover must not appear
  await assertHighlightPopoverHidden(page);

  // Voiceover must not have fired
  const spokenTexts = await page.evaluate(() => {
    return (window as typeof window & { __spokenTexts?: string[] }).__spokenTexts ?? [];
  });
  expect(spokenTexts).toHaveLength(0);
});
