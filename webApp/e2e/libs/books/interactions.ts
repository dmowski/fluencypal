import { expect, Page } from '@playwright/test';
import { ensureReaderTextVisible } from './navigation';
import {
  getCriticizingWordLocator,
  getReaderHighlightPopoverLocator,
  getYellowHighlightButtonLocator,
} from './locators';

export const clickCriticizingWord = async (page: Page) => {
  const criticizingWord = await getCriticizingWordLocator(page);
  await criticizingWord.click();
};

export const hoverCriticizingWord = async (page: Page) => {
  const criticizingWord = await getCriticizingWordLocator(page);
  await criticizingWord.hover();
};

export const hoverWordAndPressColorKey = async (
  page: Page,
  wordText: RegExp | string,
  colorKey: string,
) => {
  const textStr = typeof wordText === 'string' ? wordText : wordText.source.replace(/[^a-z]/gi, '');
  await ensureReaderTextVisible(page, textStr);

  // Use word-boundary matching so the element is found even if Playwright
  // normalises surrounding whitespace differently across rendering modes.
  const pattern =
    typeof wordText === 'string'
      ? new RegExp(`\\b${wordText}\\b`, 'i')
      : new RegExp(wordText.source.replace(/^\^|\$$/g, ''), wordText.flags);

  const wordLocator = page
    .locator('[data-word-index], .conversation-word')
    .filter({ hasText: pattern })
    .first();
  await wordLocator.hover();
  await page.keyboard.press(colorKey);
};

export const selectCriticizingWordText = async (page: Page) => {
  await ensureReaderTextVisible(page, 'criticizing');
  const criticizingWord = await getCriticizingWordLocator(page);

  const didSelect = await criticizingWord.evaluate((node) => {
    const host = node as HTMLElement;
    const charSpans = Array.from(host.querySelectorAll<HTMLElement>('[data-char-offset]'));
    if (!charSpans.length) return false;

    const renderedText = charSpans.map((entry) => entry.textContent ?? '').join('');
    const startInWord = renderedText.toLowerCase().indexOf('criticizing');
    if (startInWord < 0) return false;

    const startText = charSpans[startInWord]?.firstChild;
    const endText = charSpans[startInWord + 'criticizing'.length - 1]?.firstChild;
    if (!(startText instanceof Text) || !(endText instanceof Text)) return false;

    const range = document.createRange();
    range.setStart(startText, 0);
    range.setEnd(endText, endText.textContent?.length ?? 0);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    const mouseUpTarget = host.closest('.MuiTypography-root') ?? host;
    mouseUpTarget.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    document.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    host.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    return true;
  });

  if (!didSelect) {
    throw new Error('Could not select "criticizing" text.');
  }

  const hasPopover = await getReaderHighlightPopoverLocator(page).isVisible();
  if (hasPopover) {
    return;
  }

  const box = await criticizingWord.boundingBox();
  if (!box) {
    return;
  }

  const y = box.y + box.height / 2;
  const startX = box.x + 2;
  const endX = box.x + Math.max(3, box.width - 2);

  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(endX, y);
  await page.mouse.up();

  if (await getReaderHighlightPopoverLocator(page).isVisible()) {
    return;
  }

  // Final fallback: use the app's native word-click selection flow.
  await criticizingWord.click();
};

export const selectFirstParagraphRangeByWordBoundaries = async (
  page: Page,
  _startWordIndex: number,
  _startOffsetInWord: number,
  _endWordIndex: number,
  _endOffsetExclusiveInWord: number,
) => {
  await selectTextPhraseAndTriggerMouseUp(page, 'ounger and more vulnerab');
};

export const selectWheneverYouFeelPartialText = async (page: Page) => {
  await selectTextPhraseAndTriggerMouseUp(page, 'henever you fee');
};

export const selectWheneverYouFeelLikeText = async (page: Page) => {
  await selectTextPhraseAndTriggerMouseUp(page, 'Whenever you feel like');
};

export const selectWheneverWordText = async (page: Page) => {
  await ensureReaderTextVisible(page, 'Whenever you feel like');

  const wheneverWord = page
    .locator('[data-word-index], .conversation-word')
    .filter({ hasText: /whenever/i })
    .first();
  await expect(wheneverWord).toBeVisible();
  await wheneverWord.click();
};

export const clickWheneverWord = async (page: Page) => {
  await ensureReaderTextVisible(page, 'Whenever you feel like');

  const wheneverWord = page
    .locator('[data-word-index], .conversation-word')
    .filter({ hasText: /whenever/i })
    .first();

  await expect(wheneverWord).toBeVisible();
  await wheneverWord.click();
};

export const applyYellowHighlight = async (page: Page) => {
  await getYellowHighlightButtonLocator(page).click();
};

export const selectEverInsideNeverFoundPhrase = async (page: Page) => {
  await selectSubstringWithinContext(page, {
    contextPhrase: 'I have never found in any other person',
    selectedSubstring: 'ever',
  });
};

export const selectStoodInsideUnderstood = async (page: Page) => {
  await ensureReaderTextVisible(page, 'I understood that he meant');

  const understoodWord = page
    .locator('[data-word-index], .conversation-word')
    .filter({ hasText: /^understood$/i })
    .first();
  await expect(understoodWord).toBeVisible();

  const didSelect = await understoodWord.evaluate((node) => {
    const host = node as HTMLElement;
    const charSpans = host.querySelectorAll<HTMLElement>('[data-char-offset]');
    if (charSpans.length < 10) return false;

    const startText = charSpans[5].firstChild;
    const endText = charSpans[9].firstChild;
    if (!(startText instanceof Text) || !(endText instanceof Text)) return false;

    const range = document.createRange();
    range.setStart(startText, 0);
    range.setEnd(endText, endText.textContent?.length ?? 0);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    const mouseUpTarget = host.closest('.MuiTypography-root') ?? host;
    mouseUpTarget.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

    host.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    return true;
  });

  if (!didSelect) {
    throw new Error('Could not select partial text "stood" inside "understood".');
  }
};

const selectSubstringWithinContext = async (
  page: Page,
  {
    contextPhrase,
    selectedSubstring,
  }: {
    contextPhrase: string;
    selectedSubstring: string;
  },
) => {
  const didSelect = await page.evaluate(
    ({ context, selected }) => {
      const isVisibleTextNode = (entry: Node) => {
        const element = entry.parentElement;
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };

      const textNodes: Array<{ node: Text; start: number; end: number }> = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let concatenated = '';

      while (walker.nextNode()) {
        const current = walker.currentNode as Text;
        const content = current.textContent ?? '';
        if (!content.length) continue;
        if (!isVisibleTextNode(current)) continue;

        const start = concatenated.length;
        concatenated += content;
        textNodes.push({ node: current, start, end: concatenated.length });
      }

      const lower = concatenated.toLowerCase();
      const contextIndex = lower.indexOf(context.toLowerCase());
      if (contextIndex < 0) return false;

      const contextSlice = lower.slice(contextIndex, contextIndex + context.length);
      const selectedIndexInContext = contextSlice.indexOf(selected.toLowerCase());
      if (selectedIndexInContext < 0) return false;

      const selectionStart = contextIndex + selectedIndexInContext;
      const selectionEndExclusive = selectionStart + selected.length;

      const startSegment = textNodes.find(
        (segment) => segment.start <= selectionStart && selectionStart < segment.end,
      );
      const endSegment = textNodes.find(
        (segment) => segment.start < selectionEndExclusive && selectionEndExclusive <= segment.end,
      );
      if (!startSegment || !endSegment) return false;

      const range = document.createRange();
      range.setStart(startSegment.node, selectionStart - startSegment.start);
      range.setEnd(endSegment.node, selectionEndExclusive - endSegment.start);

      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      const eventTarget =
        (range.commonAncestorContainer instanceof HTMLElement
          ? range.commonAncestorContainer
          : range.commonAncestorContainer.parentElement) ?? document.body;
      eventTarget.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

      return true;
    },
    { context: contextPhrase, selected: selectedSubstring },
  );

  if (!didSelect) {
    throw new Error(
      `Could not select substring "${selectedSubstring}" inside context "${contextPhrase}".`,
    );
  }
};

const selectTextPhraseAndTriggerMouseUp = async (page: Page, phrase: string) => {
  const didSelect = await page.evaluate(
    ({ targetPhrase }) => {
      const isVisibleTextNode = (entry: Node) => {
        const element = entry.parentElement;
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return rect.width > 0 && rect.height > 0;
      };

      const textNodes: Array<{ node: Text; start: number; end: number }> = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let concatenated = '';

      while (walker.nextNode()) {
        const current = walker.currentNode as Text;
        const content = current.textContent ?? '';
        if (!content.length) {
          continue;
        }

        if (!isVisibleTextNode(current)) {
          continue;
        }

        const start = concatenated.length;
        concatenated += content;
        textNodes.push({ node: current, start, end: concatenated.length });
      }

      const phraseIndex = concatenated.toLowerCase().indexOf(targetPhrase.toLowerCase());
      if (phraseIndex < 0) {
        return false;
      }

      const phraseEndExclusive = phraseIndex + targetPhrase.length;
      const startSegment = textNodes.find(
        (segment) => segment.start <= phraseIndex && phraseIndex < segment.end,
      );
      const endSegment = textNodes.find(
        (segment) => segment.start < phraseEndExclusive && phraseEndExclusive <= segment.end,
      );
      if (!startSegment || !endSegment) {
        return false;
      }

      const range = document.createRange();
      range.setStart(startSegment.node, phraseIndex - startSegment.start);
      range.setEnd(endSegment.node, phraseEndExclusive - endSegment.start);

      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(range);

      const eventTarget =
        (range.commonAncestorContainer instanceof HTMLElement
          ? range.commonAncestorContainer
          : range.commonAncestorContainer.parentElement) ?? document.body;

      eventTarget.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));

      return true;
    },
    { targetPhrase: phrase },
  );

  if (!didSelect) {
    throw new Error(`Could not select phrase: ${phrase}`);
  }
};
