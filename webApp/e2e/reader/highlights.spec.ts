import { expect, test } from '@playwright/test';
import {
  assertCurrentSelectionText,
  assertHighlightPopoverVisible,
  assertOnlyWheneverHighlightedYellow,
  assertOnlyWordHighlightedYellow,
  assertPhraseHighlightedYellowWithSpaces,
  assertWheneverHighlightedYellow,
  assertWordHighlightedYellow,
  applyYellowHighlight,
  clickCriticizingWord,
  ensureReaderTextVisible,
  hoverWordAndPressColorKey,
  openSeededGatsbyBook,
  selectRememberWordInsideQuote,
  selectWheneverWordText,
  selectWheneverYouFeelLikeText,
} from '../books.helpers';

const parseCurrentPageFromIndicator = (value: string): number => {
  const match = value.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) {
    return 1;
  }

  return Number(match[1]);
};

test('applying Yellow highlight on Whenever is visible in UI', async ({ page }) => {
  await openSeededGatsbyBook(page);

  await selectWheneverWordText(page);
  await assertHighlightPopoverVisible(page);
  await applyYellowHighlight(page);
  await assertWheneverHighlightedYellow(page);
  await assertOnlyWheneverHighlightedYellow(page);
});

test('applying Yellow highlight on "Whenever you feel like" also highlights spaces', async ({
  page,
}) => {
  await openSeededGatsbyBook(page);

  await selectWheneverYouFeelLikeText(page);
  await assertHighlightPopoverVisible(page);
  await applyYellowHighlight(page);

  await assertPhraseHighlightedYellowWithSpaces(page, 'Whenever you feel like');
});

test('book info highlights list shows context and jumps to selected highlight', async ({
  page,
}) => {
  await openSeededGatsbyBook(page);

  await selectWheneverWordText(page);
  await assertHighlightPopoverVisible(page);
  await applyYellowHighlight(page);
  await assertWheneverHighlightedYellow(page);

  const pageIndicator = page.getByTestId('reader-page-indicator');

  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(120);

  const pageBeforeSelect = parseCurrentPageFromIndicator(await pageIndicator.innerText());

  await page.getByRole('button', { name: 'Book info' }).click();
  await page.getByTestId('book-info-menu-highlights').click();

  const highlightsPopover = page.getByTestId('reader-highlights-popover');
  await expect(highlightsPopover).toBeVisible();

  const highlightItems = highlightsPopover.getByTestId('reader-highlight-item');
  await expect(highlightItems).toHaveCount(1);

  const highlightItem = highlightItems.first();
  const highlightBeforeText = highlightItem.getByTestId('reader-highlight-before-text');
  const highlightSelectedText = highlightItem.getByTestId('reader-highlight-selected-text');
  const highlightAfterText = highlightItem.getByTestId('reader-highlight-after-text');

  await expect(highlightSelectedText).toHaveText(/whenever/i);
  await expect(highlightAfterText).toContainText(/you feel like criticizing/i);
  await expect(highlightBeforeText).toBeVisible();

  const selectedHighlightBackground = await highlightSelectedText.evaluate(
    (element) => window.getComputedStyle(element).backgroundColor,
  );
  expect(selectedHighlightBackground).toContain('255, 224, 102');

  const targetPage = Number((await highlightItem.getAttribute('data-target-page')) || '0');
  const normalizedTargetPage = targetPage > 1 && targetPage % 2 === 0 ? targetPage - 1 : targetPage;

  await highlightItem.click();

  await expect(page.getByTestId('book-info-modal')).not.toBeVisible();

  const pageAfterSelect = parseCurrentPageFromIndicator(await pageIndicator.innerText());

  expect(pageBeforeSelect).toBeGreaterThan(0);
  if (normalizedTargetPage > 0) {
    expect(pageAfterSelect).toBe(normalizedTargetPage);
  } else {
    expect(pageAfterSelect).toBeGreaterThan(0);
  }
});

test('hovering a word and pressing color key highlights it', async ({ page }) => {
  await openSeededGatsbyBook(page);

  await hoverWordAndPressColorKey(page, /^criticizing$/i, 'y');
  await assertWordHighlightedYellow(page, /^criticizing$/i);
});

test('hovering remember and pressing Y highlights only remember without trailing space', async ({
  page,
}) => {
  await openSeededGatsbyBook(page);

  await ensureReaderTextVisible(page, 'remember that a');
  await hoverWordAndPressColorKey(page, /^remember$/i, 'y');
  await assertOnlyWordHighlightedYellow(page, /^remember$/i);
});

test('click-selecting remember and applying Yellow highlights only remember', async ({ page }) => {
  await openSeededGatsbyBook(page);

  await ensureReaderTextVisible(page, 'remember that a');

  const rememberWord = page
    .locator('[data-word-index], .conversation-word')
    .filter({ hasText: /^remember$/i })
    .first();
  await expect(rememberWord).toBeVisible();
  await rememberWord.click();

  await assertHighlightPopoverVisible(page);
  await assertCurrentSelectionText(page, /^remember$/i);
  await applyYellowHighlight(page);
  await assertOnlyWordHighlightedYellow(page, /^remember$/i);
});

test('h1 heading word click highlights correct word without source offset shift', async ({
  page,
}) => {
  await openSeededGatsbyBook(page);

  // HeadingWordAlpha HeadingWordBeta HeadingWordGamma are in the first paragraph (# heading).
  // The # marker occupies renderableTokens[0]; without the startWordIndex=1 fix all heading
  // words are off by one, so clicking HeadingWordBeta would store offsets pointing at
  // HeadingWordAlpha and partially highlight it as well.
  await ensureReaderTextVisible(page, 'HeadingWordBeta');

  const headingWord = page
    .locator('[data-word-index], .conversation-word')
    .filter({ hasText: /^HeadingWordBeta$/i })
    .first();
  await expect(headingWord).toBeVisible();
  await headingWord.click();

  await assertHighlightPopoverVisible(page);
  await applyYellowHighlight(page);

  await assertWordHighlightedYellow(page, /^HeadingWordBeta$/i);

  // With a wrong offset HeadingWordAlpha chars would overlap HeadingWordBeta's offsets,
  // causing some of HeadingWordAlpha's characters to be highlighted too.
  const alphaHasYellowChars = await page.evaluate(() => {
    const normalize = (v: string) => v.replace(/[*_~`]+/g, '').trim();
    const candidates = Array.from(
      document.querySelectorAll<HTMLElement>('[data-word-index], .conversation-word'),
    );
    const host = candidates.find((el) =>
      /^HeadingWordAlpha$/i.test(normalize(el.textContent ?? '')),
    );
    if (!host) return false;
    const charSpans = Array.from(host.querySelectorAll<HTMLElement>('[data-char-offset]'));
    return charSpans.some((el) =>
      window.getComputedStyle(el).backgroundColor.includes('255, 224, 102'),
    );
  });
  expect(alphaHasYellowChars).toBe(false);
});

test('manual selection of remember and applying Yellow highlights only remember', async ({
  page,
}) => {
  await openSeededGatsbyBook(page);

  await ensureReaderTextVisible(page, 'remember that all the people');
  await selectRememberWordInsideQuote(page);

  await assertHighlightPopoverVisible(page);
  await assertCurrentSelectionText(page, /^remember$/i);
  await applyYellowHighlight(page);
  await assertOnlyWordHighlightedYellow(page, /^remember$/i);
});
