import { expect, Page } from '@playwright/test';

export const BOOK_TITLE = 'The Great Gatsby';
export const BOOK_SUBTITLE = 'Then wear the gold hat, if that will move her';

type SpokenWindow = typeof window & { __spokenTexts?: string[] };

export const openSeededGatsbyBook = async (page: Page) => {
  await page.addInitScript(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });

  await page.goto('/book');

  const gatsbyCardTitle = page.getByRole('heading', { name: BOOK_TITLE, level: 4 });
  await expect(gatsbyCardTitle).toBeVisible();
  await gatsbyCardTitle.click();

  await expect(page.getByText(BOOK_SUBTITLE, { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reader settings' })).toBeVisible();
};

export const getCriticizingWordLocator = async (page: Page) => {
  const orderedSelectors = ['[data-word-index]', '.conversation-word', 'p span', 'div span'];

  for (const selector of orderedSelectors) {
    const candidate = page
      .locator(selector)
      .filter({ hasText: /\bcriticizing\b/i })
      .first();
    const exists = (await candidate.count()) > 0;
    if (!exists) {
      continue;
    }

    if (await candidate.isVisible()) {
      return candidate;
    }
  }

  throw new Error('Could not find visible criticizing word in reader content.');
};

export const assertWordHoverHasEffect = async (page: Page) => {
  const criticizingWord = await getCriticizingWordLocator(page);
  await criticizingWord.hover();

  const hoverAfterBackgroundColor = await criticizingWord.evaluate((node) => {
    const directPseudo = window.getComputedStyle(node, '::after').backgroundColor;
    if (directPseudo !== 'rgba(0, 0, 0, 0)') {
      return directPseudo;
    }

    const wordContainer = node.closest(
      '[data-word-index], .conversation-word',
    ) as HTMLElement | null;

    if (!wordContainer) {
      return directPseudo;
    }

    return window.getComputedStyle(wordContainer, '::after').backgroundColor;
  });

  expect(hoverAfterBackgroundColor).not.toBe('rgba(0, 0, 0, 0)');
};

export const installSpeechMock = async (page: Page) => {
  await page.addInitScript(() => {
    const spokenTexts: string[] = [];

    class MockUtterance {
      text: string;

      lang = '';

      voice: SpeechSynthesisVoice | null = null;

      onend: null | (() => void) = null;

      constructor(text: string) {
        this.text = text;
      }
    }

    const voices = [
      {
        default: true,
        lang: 'en-US',
        localService: true,
        name: 'Mock English Voice',
        voiceURI: 'mock-en-us-voice',
      },
    ] as SpeechSynthesisVoice[];

    const speechSynthesisMock = {
      _listeners: new Map<string, Set<() => void>>(),
      cancel: () => undefined,
      pause: () => undefined,
      resume: () => undefined,
      getVoices: () => voices,
      speak: (utterance: { text?: string; onend?: (() => void) | null }) => {
        spokenTexts.push((utterance.text || '').trim());
        if (utterance.onend) {
          setTimeout(() => utterance.onend?.(), 0);
        }
      },
      addEventListener: (eventName: string, listener: () => void) => {
        const listeners = speechSynthesisMock._listeners.get(eventName) ?? new Set<() => void>();
        listeners.add(listener);
        speechSynthesisMock._listeners.set(eventName, listeners);
      },
      removeEventListener: (eventName: string, listener: () => void) => {
        const listeners = speechSynthesisMock._listeners.get(eventName);
        listeners?.delete(listener);
      },
    };

    Object.defineProperty(window, 'speechSynthesis', {
      configurable: true,
      writable: true,
      value: speechSynthesisMock,
    });

    Object.defineProperty(window, 'SpeechSynthesisUtterance', {
      configurable: true,
      writable: true,
      value: MockUtterance,
    });

    Object.defineProperty(window, '__spokenTexts', {
      configurable: true,
      writable: true,
      value: spokenTexts,
    });
  });
};

export const openSettingsPopover = async (page: Page) => {
  await page.getByRole('button', { name: 'Reader settings' }).click();
  await expect(
    page.locator('.MuiPopover-paper').getByText('Settings', { exact: true }),
  ).toBeVisible();
};

export const closeSettingsPopover = async (page: Page) => {
  const selectMenu = page.locator('div[id^="menu-"][role="presentation"]');
  if (await selectMenu.isVisible().catch(() => false)) {
    await page.keyboard.press('Escape');
    await expect(selectMenu).not.toBeVisible();
  }

  const popover = page.locator('.MuiPopover-paper');
  const isSettingsVisible = await popover.isVisible().catch(() => false);
  if (isSettingsVisible) {
    const popoverCloseButton = popover.getByRole('button', { name: 'Close settings' });

    await popoverCloseButton.click({ force: true }).catch(async () => {
      await page.mouse.click(900, 500);
    });
  }

  await expect(popover).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Reader settings' })).toBeVisible();
};

export const ensureReaderTextVisible = async (
  page: Page,
  targetText: string,
  options?: { maxSteps?: number },
) => {
  const maxSteps = options?.maxSteps ?? 12;

  for (let step = 0; step <= maxSteps; step += 1) {
    const isVisible = await page.evaluate((text) => {
      const bodyText = document.body.textContent ?? '';
      return bodyText.toLowerCase().includes(text.toLowerCase());
    }, targetText);

    if (isVisible) {
      return;
    }

    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(120);
  }

  throw new Error(`Could not find reader text after ${maxSteps} page steps: ${targetText}`);
};

export const selectRussianTranslateTarget = async (page: Page) => {
  await page.getByLabel('Translate to').click();
  await page.getByRole('option', { name: 'Russian' }).click();
  await expect(page.locator('div[id^="menu-"][role="presentation"]')).not.toBeVisible();
};

export const assertVoicePreviewWasPlayed = async (page: Page) => {
  await expect
    .poll(async () =>
      page.evaluate(() => {
        return (window as SpokenWindow).__spokenTexts?.length ?? 0;
      }),
    )
    .toBeGreaterThan(0);
};

export const clickCriticizingWord = async (page: Page) => {
  const criticizingWord = await getCriticizingWordLocator(page);
  await criticizingWord.click();
};

export const hoverCriticizingWord = async (page: Page) => {
  const criticizingWord = await getCriticizingWordLocator(page);
  await criticizingWord.hover();
};

export const selectCriticizingWordText = async (page: Page) => {
  const criticizingWord = await getCriticizingWordLocator(page);

  await criticizingWord.evaluate((node) => {
    const findFirstTextNode = (entry: Node): Text | null => {
      if (entry.nodeType === Node.TEXT_NODE) return entry as Text;

      for (const child of Array.from(entry.childNodes)) {
        const found = findFirstTextNode(child);
        if (found) return found;
      }

      return null;
    };

    const findLastTextNode = (entry: Node): Text | null => {
      if (entry.nodeType === Node.TEXT_NODE) return entry as Text;

      const children = Array.from(entry.childNodes);
      for (let i = children.length - 1; i >= 0; i -= 1) {
        const found = findLastTextNode(children[i]);
        if (found) return found;
      }

      return null;
    };

    const host = node as HTMLElement;
    const first = findFirstTextNode(host);
    const last = findLastTextNode(host);
    if (!first || !last) return;

    const range = document.createRange();
    range.setStart(first, 0);
    range.setEnd(last, last.textContent?.length ?? 0);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    const mouseUpTarget = host.closest('.MuiTypography-root') ?? host;
    mouseUpTarget.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  });
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

export const selectEverInsideNeverFoundPhrase = async (page: Page) => {
  await selectSubstringWithinContext(page, {
    contextPhrase: 'I have never found in any other person',
    selectedSubstring: 'ever',
  });
};

export const selectStoodInsideUnderstood = async (page: Page) => {
  await selectSubstringWithinContext(page, {
    contextPhrase: 'I understood that he meant',
    selectedSubstring: 'stood',
  });
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

export const assertCriticizingWordWasSpoken = async (page: Page) => {
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const spoken = (window as SpokenWindow).__spokenTexts ?? [];
        return spoken.some((text) => /criticizing/i.test(text));
      }),
    )
    .toBeTruthy();
};

export const assertHighlightPopoverVisible = async (page: Page) => {
  await expect(page.getByRole('button', { name: 'Y', exact: true })).toBeVisible();
};

export const assertCurrentSelectionText = async (page: Page, expectedRegex: RegExp) => {
  await expect
    .poll(async () =>
      page.evaluate(() => {
        return window.getSelection()?.toString().trim() ?? '';
      }),
    )
    .toMatch(expectedRegex);
};

export const assertSelectionTextPersists = async (
  page: Page,
  expectedRegex: RegExp,
  options?: { checks?: number; intervalMs?: number },
) => {
  const checks = options?.checks ?? 6;
  const intervalMs = options?.intervalMs ?? 120;

  for (let i = 0; i < checks; i += 1) {
    await assertCurrentSelectionText(page, expectedRegex);
    if (i < checks - 1) {
      await page.waitForTimeout(intervalMs);
    }
  }
};

export const assertCriticizingWordCursorIsPointer = async (page: Page) => {
  const criticizingWord = await getCriticizingWordLocator(page);

  const cursors = await criticizingWord.evaluate((node) => {
    const element = node as HTMLElement;
    const descendants = Array.from(element.querySelectorAll<HTMLElement>('*'));
    const nodes = [element, ...descendants];

    return nodes.map((entry) => window.getComputedStyle(entry).cursor);
  });

  expect(cursors.length).toBeGreaterThan(0);
  expect(cursors.every((cursor) => cursor === 'pointer')).toBeTruthy();
};

export const enableTranslateOnHover = async (page: Page) => {
  const translateOnHover = page.getByRole('checkbox', { name: 'Translate on Hover' });
  await expect(translateOnHover).toBeVisible();
  await translateOnHover.check();
};

export const setRenderMarkdown = async (page: Page, isEnabled: boolean) => {
  const renderMarkdown = page.getByRole('checkbox', { name: 'Render Markdown' });
  await expect(renderMarkdown).toBeVisible();

  if ((await renderMarkdown.isChecked()) === isEnabled) {
    return;
  }

  if (isEnabled) {
    await renderMarkdown.check();
    return;
  }

  await renderMarkdown.uncheck();
};

export const mockSingleTranslation = async (page: Page, translatedText: string) => {
  let translateRequestsCount = 0;

  await page.route('**/api/translate', async (route) => {
    translateRequestsCount += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        translatedText,
      }),
    });
  });

  return {
    getCount: () => translateRequestsCount,
  };
};

export const assertTranslatedTextVisible = async (page: Page, text: string) => {
  await expect(page.getByText(text, { exact: true }).first()).toBeVisible();
};

export const assertSpaceBetweenLikeAndCriticizing = async (page: Page) => {
  const readerText = await page.locator('body').evaluate((el) => el.textContent ?? '');
  const stripped = readerText.replace(/[*_~`]/g, '');
  const normalized = stripped.replace(/\s+/g, ' ');
  expect(normalized).toMatch(/like criticizing/);
};
