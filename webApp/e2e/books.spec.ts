import { expect, test } from '@playwright/test';
import {
  assertCriticizingWordCursorIsPointer,
  assertCriticizingWordWasSpoken,
  assertCurrentSelectionText,
  assertHighlightPopoverVisible,
  assertSelectionTextPersists,
  assertSpaceBetweenLikeAndCriticizing,
  assertTranslatedTextVisible,
  assertVoicePreviewWasPlayed,
  assertWordHoverHasEffect,
  clickCriticizingWord,
  closeSettingsPopover,
  ensureReaderTextVisible,
  enableTranslateOnHover,
  hoverCriticizingWord,
  installSpeechMock,
  mockSingleTranslation,
  openSeededGatsbyBook,
  openSettingsPopover,
  selectEverInsideNeverFoundPhrase,
  selectWheneverWordText,
  selectFirstParagraphRangeByWordBoundaries,
  selectCriticizingWordText,
  selectStoodInsideUnderstood,
  selectWheneverYouFeelPartialText,
  selectRussianTranslateTarget,
  setRenderMarkdown,
  applyYellowHighlight,
  assertWheneverHighlightedYellow,
} from './books.helpers';

const renderModes = [
  { isUseMarkdown: true, label: 'markdown rendering' },
  { isUseMarkdown: false, label: 'plain rendering' },
] as const;

for (const renderMode of renderModes) {
  test.describe(renderMode.label, () => {
    test('reader shows criticizing word and hover effect', async ({ page }) => {
      await openSeededGatsbyBook(page);
      await openSettingsPopover(page);
      await setRenderMarkdown(page, renderMode.isUseMarkdown);
      await closeSettingsPopover(page);

      await assertWordHoverHasEffect(page);
    });

    test('reader settings voice plays preview and clicking word plays and opens highlight popover', async ({
      page,
    }) => {
      await installSpeechMock(page);
      await openSeededGatsbyBook(page);

      await openSettingsPopover(page);
      await setRenderMarkdown(page, renderMode.isUseMarkdown);
      await page.getByLabel('Voice').click();
      await page.getByRole('option', { name: 'Mock English Voice' }).click();
      await expect(page.locator('div[id^="menu-"][role="presentation"]')).not.toBeVisible();
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
      await openSettingsPopover(page);
      await setRenderMarkdown(page, renderMode.isUseMarkdown);
      await closeSettingsPopover(page);

      await selectCriticizingWordText(page);

      await assertHighlightPopoverVisible(page);
      await assertCurrentSelectionText(page, /criticizing/i);
      await assertSelectionTextPersists(page, /criticizing/i);
    });

    test('partial selection does not shift text around younger/vulnerable phrase', async ({
      page,
    }) => {
      await openSeededGatsbyBook(page);
      await openSettingsPopover(page);
      await setRenderMarkdown(page, renderMode.isUseMarkdown);
      await closeSettingsPopover(page);

      // Select from "o" in "younger" (offset 1 in word) to after "b" in "vulnerable" (offset 8).
      await selectFirstParagraphRangeByWordBoundaries(page, 2, 1, 5, 8);

      await assertHighlightPopoverVisible(page);
      await assertCurrentSelectionText(page, /^ounger and more vulnerab$/i);
      await assertSelectionTextPersists(page, /^ounger and more vulnerab$/i);
    });

    test('partial selection does not collapse for whenever/feel phrase', async ({ page }) => {
      await openSeededGatsbyBook(page);
      await openSettingsPopover(page);
      await setRenderMarkdown(page, renderMode.isUseMarkdown);
      await closeSettingsPopover(page);

      await selectWheneverYouFeelPartialText(page);

      await assertHighlightPopoverVisible(page);
      await assertCurrentSelectionText(page, /^henever you fee$/i);
      await assertSelectionTextPersists(page, /^henever you fee$/i);
    });

    test('selecting ever in "I have never found" stays on intended ever', async ({ page }) => {
      await openSeededGatsbyBook(page);
      await openSettingsPopover(page);
      await setRenderMarkdown(page, renderMode.isUseMarkdown);
      await closeSettingsPopover(page);

      await ensureReaderTextVisible(page, 'I have never found in any other person');

      await selectEverInsideNeverFoundPhrase(page);

      await assertHighlightPopoverVisible(page);
      await assertCurrentSelectionText(page, /^ever$/i);
      await assertSelectionTextPersists(page, /^ever$/i);
    });

    test('selecting stood in understood keeps partial selection only', async ({ page }) => {
      await openSeededGatsbyBook(page);
      await openSettingsPopover(page);
      await setRenderMarkdown(page, renderMode.isUseMarkdown);
      await closeSettingsPopover(page);

      await selectStoodInsideUnderstood(page);

      await assertHighlightPopoverVisible(page);
      await assertCurrentSelectionText(page, /^stood$/i);
      await assertSelectionTextPersists(page, /^stood$/i);
    });

    test('reader uses pointer cursor consistently for interactive words', async ({ page }) => {
      await openSeededGatsbyBook(page);
      await openSettingsPopover(page);
      await setRenderMarkdown(page, renderMode.isUseMarkdown);
      await closeSettingsPopover(page);

      await assertCriticizingWordCursorIsPointer(page);
    });

    test('applying Yellow highlight on Whenever is visible in UI', async ({ page }) => {
      await openSeededGatsbyBook(page);
      await openSettingsPopover(page);
      await setRenderMarkdown(page, renderMode.isUseMarkdown);
      await closeSettingsPopover(page);

      await selectWheneverWordText(page);
      await assertHighlightPopoverVisible(page);
      await applyYellowHighlight(page);
      await assertWheneverHighlightedYellow(page);
    });

    test('translate on hover sends one request and shows tooltip; click shows popover with translated text', async ({
      page,
    }) => {
      await installSpeechMock(page);

      const translationSpy = await mockSingleTranslation(page, 'критиковать');

      await openSeededGatsbyBook(page);
      await openSettingsPopover(page);
      await setRenderMarkdown(page, renderMode.isUseMarkdown);
      await enableTranslateOnHover(page);
      await selectRussianTranslateTarget(page);
      await closeSettingsPopover(page);

      await hoverCriticizingWord(page);

      await assertTranslatedTextVisible(page, 'критиковать');
      await expect.poll(() => translationSpy.getCount()).toBe(1);

      await clickCriticizingWord(page);
      await assertHighlightPopoverVisible(page);
      await assertTranslatedTextVisible(page, 'критиковать');
    });

    test('reader renders a space between "like" and "criticizing"', async ({ page }) => {
      await openSeededGatsbyBook(page);
      await openSettingsPopover(page);
      await setRenderMarkdown(page, renderMode.isUseMarkdown);
      await closeSettingsPopover(page);

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
      await openSettingsPopover(page);
      await setRenderMarkdown(page, renderMode.isUseMarkdown);
      await closeSettingsPopover(page);

      expect(
        hydrationErrors,
        `Hydration errors found:\n${hydrationErrors.join('\n')}`,
      ).toHaveLength(0);
    });
  });
}
