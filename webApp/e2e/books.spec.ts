import { expect, test } from '@playwright/test';
import {
  assertCriticizingWordCursorIsPointer,
  assertCriticizingWordWasSpoken,
  assertCurrentSelectionText,
  assertPhraseHighlightedYellowWithSpaces,
  assertHighlightPopoverHidden,
  assertHighlightPopoverVisible,
  assertOnlyWheneverHighlightedYellow,
  assertSelectionTextPersists,
  assertSpaceBetweenLikeAndCriticizing,
  assertTranslatedTextVisible,
  assertVoicePreviewWasPlayed,
  assertWheneverHighlightedYellow,
  assertWordHighlightedYellow,
  assertWordHoverHasEffect,
  applyYellowHighlight,
  assertOnlyWordHighlightedYellow,
  clickCriticizingWord,
  closeSettingsPopover,
  enableTranslateOnHover,
  enableVoiceOverSelectedText,
  ensureReaderTextVisible,
  hoverCriticizingWord,
  hoverWordAndPressColorKey,
  installSpeechMock,
  mockSingleTranslation,
  openSeededGatsbyBook,
  openSettingsPopover,
  selectCriticizingWordText,
  selectEverInsideNeverFoundPhrase,
  selectFirstParagraphRangeByWordBoundaries,
  selectRussianTranslateTarget,
  selectRememberWordInsideQuote,
  selectStoodInsideUnderstood,
  selectWheneverYouFeelLikeText,
  selectWheneverWordText,
  selectWheneverYouFeelPartialText,
  BOOK_SUBTITLE,
  BOOK_TITLE,
} from './books.helpers';
import { PARAGRAPH_TEXT_INDENT } from '@/features/Reader/utils/readerParagraphFormatting';

const parseCurrentPageFromIndicator = (value: string): number => {
  const match = value.match(/(\d+)\s*\/\s*(\d+)/);
  if (!match) {
    return 1;
  }

  return Number(match[1]);
};

test.describe('markdown rendering', () => {
  test('updates browser tab title for active book and restores it after close', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.localStorage.clear();
      window.sessionStorage.clear();
      if (typeof indexedDB !== 'undefined') {
        indexedDB.deleteDatabase('readerBooksDb');
      }
    });

    await page.goto('/book');

    const initialTitle = await page.title();

    const gatsbyCardTitle = page.getByRole('heading', { name: BOOK_TITLE, level: 4 });
    await expect(gatsbyCardTitle).toBeVisible();
    await gatsbyCardTitle.click();

    await expect(page.getByText(BOOK_SUBTITLE, { exact: true })).toBeVisible();
    await expect(page).toHaveTitle(BOOK_TITLE);

    await page.keyboard.press('Escape');
    await expect(gatsbyCardTitle).toBeVisible();
    await expect(page).toHaveTitle(initialTitle);
  });

  test('resize keeps first visible word anchored and temporary highlight is removed after 1 second', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await openSeededGatsbyBook(page);

    const firstVisibleAnchor = await page.evaluate(() => {
      const contentElement = document.querySelector<HTMLElement>('[data-testid="reader-content"]');
      if (!contentElement) {
        return null;
      }

      const contentRect = contentElement.getBoundingClientRect();
      const candidates = Array.from(
        contentElement.querySelectorAll<HTMLElement>('[data-reader-word-anchor="true"]'),
      );

      for (const element of candidates) {
        const rect = element.getBoundingClientRect();
        const isVisible =
          rect.height > 0 &&
          rect.width > 0 &&
          rect.bottom > contentRect.top + 1 &&
          rect.top < contentRect.bottom - 1;

        if (!isVisible) {
          continue;
        }

        const key = element.dataset.readerAnchorKey ?? null;
        const text = (element.textContent ?? '').trim();
        if (!key || !text) {
          continue;
        }

        return { key, text };
      }

      return null;
    });

    expect(firstVisibleAnchor).not.toBeNull();
    if (!firstVisibleAnchor) {
      return;
    }

    await page.setViewportSize({ width: 1700, height: 900 });

    const highlightedAnchor = page.locator(
      `[data-resize-anchor-highlighted="true"][data-reader-anchor-key="${firstVisibleAnchor.key}"]`,
    );
    await expect(highlightedAnchor).toBeVisible({ timeout: 4000 });

    const isAnchorVisibleWithinReader = await highlightedAnchor.first().evaluate((element) => {
      const contentElement = element.closest(
        '[data-testid="reader-content"]',
      ) as HTMLElement | null;
      if (!contentElement) {
        return false;
      }

      const elementRect = element.getBoundingClientRect();
      const contentRect = contentElement.getBoundingClientRect();

      return elementRect.bottom > contentRect.top + 1 && elementRect.top < contentRect.bottom - 1;
    });

    expect(isAnchorVisibleWithinReader).toBe(true);

    await page.waitForTimeout(1200);
    await expect(page.locator('[data-resize-anchor-highlighted="true"]')).toHaveCount(0);
  });

  test('reader shows criticizing word and hover effect', async ({ page }) => {
    await openSeededGatsbyBook(page);

    await assertWordHoverHasEffect(page);
  });

  test('reader applies first-line indent for regular paragraphs', async ({ page }) => {
    await openSeededGatsbyBook(page);

    const paragraphIndentMetrics = await page.evaluate(() => {
      const candidates = Array.from(
        document.querySelectorAll<HTMLElement>('[data-word-index], .conversation-word'),
      );
      const wheneverHost = candidates.find((entry) =>
        (entry.textContent ?? '').toLowerCase().includes('whenever'),
      );
      if (!wheneverHost) {
        return null;
      }

      const paragraphRoot = wheneverHost.closest('.MuiTypography-root') as HTMLElement | null;
      if (!paragraphRoot) {
        return null;
      }

      const computedStyle = window.getComputedStyle(paragraphRoot);

      return {
        textIndent: computedStyle.textIndent,
        rootFontSize: window.getComputedStyle(document.documentElement).fontSize,
      };
    });

    expect(paragraphIndentMetrics).not.toBeNull();
    if (!paragraphIndentMetrics) {
      return;
    }

    const computedIndent = Number.parseFloat(paragraphIndentMetrics.textIndent);
    const rootFontSize = Number.parseFloat(paragraphIndentMetrics.rootFontSize);

    expect(computedIndent).toBeGreaterThan(0);
    expect(computedIndent).toBeCloseTo(rootFontSize * PARAGRAPH_TEXT_INDENT, 1);
  });

  test('reader does not indent paragraph fragments continued on the next page', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 720, height: 540 });
    await openSeededGatsbyBook(page);

    const maxSteps = 12;

    for (let step = 0; step <= maxSteps; step += 1) {
      const continuationIndent = await page.evaluate(() => {
        const continuationParagraph = Array.from(
          document.querySelectorAll<HTMLElement>('[data-reader-paragraph-is-continuation="true"]'),
        ).find((element) => {
          const rect = element.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });

        if (!continuationParagraph) {
          return null;
        }

        return window.getComputedStyle(continuationParagraph).textIndent;
      });

      if (continuationIndent != null) {
        expect(Number.parseFloat(continuationIndent)).toBe(0);
        return;
      }

      await page.keyboard.press('ArrowRight');
      await page.waitForTimeout(120);
    }

    throw new Error('Could not find a visible continued paragraph fragment to verify indent');
  });

  test('reader settings voice plays preview and clicking word plays and opens highlight popover', async ({
    page,
  }) => {
    await installSpeechMock(page);
    await openSeededGatsbyBook(page);

    await openSettingsPopover(page);
    await page.getByRole('combobox', { name: 'Voice' }).click();
    await page.getByRole('option', { name: 'Mock English Voice' }).click();
    await expect(page.locator('div[id^="menu-"][role="presentation"]')).not.toBeVisible();
    await enableVoiceOverSelectedText(page);
    await closeSettingsPopover(page);

    await assertVoicePreviewWasPlayed(page);
    await clickCriticizingWord(page);
    await assertCriticizingWordWasSpoken(page);
    await assertHighlightPopoverVisible(page);
    await assertCurrentSelectionText(page, /criticizing/i);
    await assertSelectionTextPersists(page, /criticizing/i);
  });

  test('selected text keeps selection visible when highlight popover opens', async ({ page }) => {
    await openSeededGatsbyBook(page);

    await selectCriticizingWordText(page);

    await assertHighlightPopoverVisible(page);
    await assertCurrentSelectionText(page, /criticizing/i);
  });

  test('drag-selected text is spoken when voice over is enabled', async ({ page }) => {
    await installSpeechMock(page);
    await openSeededGatsbyBook(page);

    await openSettingsPopover(page);
    await page.getByRole('combobox', { name: 'Voice' }).click();
    await page.getByRole('option', { name: 'Mock English Voice' }).click();
    await expect(page.locator('div[id^="menu-"][role="presentation"]')).not.toBeVisible();
    await enableVoiceOverSelectedText(page);
    await closeSettingsPopover(page);

    await selectCriticizingWordText(page);
    await assertCriticizingWordWasSpoken(page);
  });

  test('voice over speaks new word when clicked right after previous word selection', async ({
    page,
  }) => {
    await installSpeechMock(page);
    await openSeededGatsbyBook(page);

    await openSettingsPopover(page);
    await page.getByRole('combobox', { name: 'Voice' }).click();
    await page.getByRole('option', { name: 'Mock English Voice' }).click();
    await expect(page.locator('div[id^="menu-"][role="presentation"]')).not.toBeVisible();
    await enableVoiceOverSelectedText(page);
    await closeSettingsPopover(page);

    // Ensure both words are visible before the timed section
    await ensureReaderTextVisible(page, 'remember');

    // Get bounding box of "remember" upfront so the second click is immediate
    const rememberLocator = page
      .locator('[data-word-index]')
      .filter({ hasText: /^remember$/i })
      .first();
    const rememberBox = await rememberLocator.boundingBox();
    expect(rememberBox).not.toBeNull();

    // Click "criticizing" — sets up selection-restore observer (500 ms window).
    await clickCriticizingWord(page);

    // Immediately click "remember" with real mouse events (mousedown fires onMouseDown
    // which cancels the restore observer before selectionchange can re-apply "criticizing").
    await page.mouse.click(
      rememberBox!.x + rememberBox!.width / 2,
      rememberBox!.y + rememberBox!.height / 2,
    );

    // "remember" must have been spoken (not suppressed by the stale restore)
    await expect
      .poll(async () =>
        page.evaluate(() => {
          const spoken =
            (window as typeof window & { __spokenTexts?: string[] }).__spokenTexts ?? [];
          return spoken.some((text) => /\bremember\b/i.test(text));
        }),
      )
      .toBeTruthy();
  });

  test('partial selection does not shift text around younger/vulnerable phrase', async ({
    page,
  }) => {
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

  test('reader uses pointer cursor consistently for interactive words', async ({ page }) => {
    await openSeededGatsbyBook(page);

    await assertCriticizingWordCursorIsPointer(page);
  });

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
    const normalizedTargetPage =
      targetPage > 1 && targetPage % 2 === 0 ? targetPage - 1 : targetPage;

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

  test('translate on hover sends one request and shows tooltip; click shows popover with translated text', async ({
    page,
  }) => {
    await installSpeechMock(page);

    const translationSpy = await mockSingleTranslation(page, 'критиковать');

    await openSeededGatsbyBook(page);
    await openSettingsPopover(page);
    await enableTranslateOnHover(page);
    await selectRussianTranslateTarget(page);
    await closeSettingsPopover(page);

    await hoverCriticizingWord(page);

    await assertTranslatedTextVisible(page, 'критиковать');
    await expect.poll(() => translationSpy.getCount()).toBeGreaterThan(0);

    await clickCriticizingWord(page);
    await assertHighlightPopoverVisible(page);
    await assertTranslatedTextVisible(page, 'критиковать');
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

  test('click-selecting remember and applying Yellow highlights only remember', async ({
    page,
  }) => {
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

  test('reader renders a space between "like" and "criticizing"', async ({ page }) => {
    await openSeededGatsbyBook(page);

    await assertSpaceBetweenLikeAndCriticizing(page);
  });

  test('reader does not produce hydration errors on open', async ({ page }) => {
    const hydrationErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (
          text.includes('Hydration') ||
          text.includes('hydration') ||
          text.includes('cannot be a descendant') ||
          text.includes('did not match')
        ) {
          hydrationErrors.push(text);
        }
      }
    });

    await openSeededGatsbyBook(page);

    expect(hydrationErrors, `Hydration errors found:\n${hydrationErrors.join('\n')}`).toHaveLength(
      0,
    );
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
});
