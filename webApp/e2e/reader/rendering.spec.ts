import { expect, test } from '@playwright/test';
import {
  assertWordHoverHasEffect,
  assertSpaceBetweenLikeAndCriticizing,
  openSeededGatsbyBook,
  openBooksPageWithCleanStorage,
  importBookFromPicker,
  ensureReaderTextVisible,
  BOOK_TITLE,
  BOOK_SUBTITLE,
} from '../libs/reader';
import { assertReaderContentFitsCurrentPage } from '../libs/books/renderingAssertions';
import { PARAGRAPH_TEXT_INDENT } from '@/features/Reader/utils/readerParagraphFormatting';

const BOOK_FIXTURE_PATH = 'e2e/fixtures/Supercommunicators.epub';
const EXPECTED_ITALIC_SENTENCE_FRAGMENT = 'memorizes rugby world champions from the 1960s?';
const EXPECTED_ITALIC_WORD = 'Who,';
const EXPECTED_HIDDEN_SYSTEM_TOKEN = '_146236082';
const EXPECTED_CHAPTER_HEADING = 'WHEN BRAINS CONNECT';
const EXPECTED_CONVERSATION_FRAGMENT = 'High Centrality Participant 1';

test('updates browser tab title for active book and restores it after close', async ({ page }) => {
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

  page.once('dialog', (dialog) => dialog.accept());
  await page.keyboard.press('Escape');
  await expect(gatsbyCardTitle).toBeVisible();
  await expect(page).toHaveTitle(initialTitle);
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

test('reader does not indent paragraph fragments continued on the next page', async ({ page }) => {
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

  expect(hydrationErrors, `Hydration errors found:\n${hydrationErrors.join('\n')}`).toHaveLength(0);
});

test('first page content fits viewport at 1400x700 (cover image)', async ({ page }) => {
  await page.setViewportSize({ width: 1400, height: 700 });

  await openBooksPageWithCleanStorage(page);
  await importBookFromPicker(page, BOOK_FIXTURE_PATH);

  await expect(page.getByRole('heading', { name: 'Supercommunicators', level: 2 })).toBeVisible({ timeout: 60_000 });

  await page.getByRole('heading', { name: 'Supercommunicators', level: 2 }).click();
  await page.getByRole('button', { name: 'Read' }).click();
  await expect(page.getByRole('button', { name: 'Book info' })).toBeVisible();

  await assertReaderContentFitsCurrentPage(page);
});

test('renders punctuation-adjacent markdown emphasis as italic text', async ({ page }) => {
  test.setTimeout(180_000);

  await openBooksPageWithCleanStorage(page);
  await importBookFromPicker(page, BOOK_FIXTURE_PATH);

  await expect(page.getByRole('heading', { name: 'Supercommunicators', level: 2 })).toBeVisible({ timeout: 60_000 });

  await ensureReaderTextVisible(page, EXPECTED_ITALIC_SENTENCE_FRAGMENT, {
    maxSteps: 40,
  });

  const readerContent = page.getByTestId('reader-content');
  const italicWho = readerContent.locator('em').filter({ hasText: EXPECTED_ITALIC_WORD }).first();
  const italicSentenceFragment = readerContent
    .locator('em')
    .filter({ hasText: EXPECTED_ITALIC_SENTENCE_FRAGMENT })
    .first();

  await expect(italicWho).toBeVisible();
  await expect(italicSentenceFragment).toBeVisible();
  await expect(readerContent.getByText('_Who,_', { exact: false })).toHaveCount(0);
});

test('hides system token and renders chapter markdown heading as semantic heading', async ({
  page,
}) => {
  test.setTimeout(180_000);

  await openBooksPageWithCleanStorage(page);
  await importBookFromPicker(page, BOOK_FIXTURE_PATH);

  await expect(page.getByRole('heading', { name: 'Supercommunicators', level: 2 })).toBeVisible({ timeout: 60_000 });

  await ensureReaderTextVisible(page, EXPECTED_CHAPTER_HEADING, {
    maxSteps: 60,
  });

  const readerContent = page.getByTestId('reader-content');
  const chapterHeading = readerContent
    .locator('h3')
    .filter({ hasText: EXPECTED_CHAPTER_HEADING })
    .first();

  await expect(chapterHeading).toBeVisible();
  await expect(
    readerContent.getByText(`### ${EXPECTED_CHAPTER_HEADING}`, { exact: false }),
  ).toHaveCount(0);
  await expect(page.getByText(EXPECTED_HIDDEN_SYSTEM_TOKEN, { exact: false })).toHaveCount(0);
});

test('renders conversation block without standalone blockquote marker lines', async ({ page }) => {
  test.setTimeout(180_000);

  await openBooksPageWithCleanStorage(page);
  await importBookFromPicker(page, BOOK_FIXTURE_PATH);

  await expect(page.getByRole('heading', { name: 'Supercommunicators', level: 2 })).toBeVisible({ timeout: 60_000 });

  await ensureReaderTextVisible(page, EXPECTED_CONVERSATION_FRAGMENT, {
    maxSteps: 80,
  });

  const readerContent = page.getByTestId('reader-content');
  const readerText = await readerContent.innerText();
  const standaloneBlockquoteLines = readerText
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line === '>');

  expect(standaloneBlockquoteLines).toHaveLength(0);
});

test('renders a small chapter opener image before THE MATCHING PRINCIPLE heading', async ({
  page,
}) => {
  test.setTimeout(180_000);

  await openBooksPageWithCleanStorage(page);
  await importBookFromPicker(page, BOOK_FIXTURE_PATH);

  await expect(page.getByRole('heading', { name: 'Supercommunicators', level: 2 })).toBeVisible({ timeout: 60_000 });

  await page.getByRole('button', { name: 'Read' }).click();
  await page.getByRole('button', { name: 'Book info' }).click();
  await page.getByTestId('book-info-menu-chapters').click();

  const chapterPopover = page.getByTestId('reader-chapters-popover');
  await expect(chapterPopover).toBeVisible();

  const chapterOneEntry = chapterPopover
    .getByTestId('reader-chapter-item')
    .filter({ hasText: /chapter one|the matching principle/i })
    .first();
  await expect(chapterOneEntry).toBeVisible();
  await chapterOneEntry.click();

  await expect(page.getByTestId('book-info-modal')).not.toBeVisible();
  await expect(
    page
      .getByTestId('reader-content')
      .getByText('THE MATCHING PRINCIPLE', { exact: false })
      .first(),
  ).toBeVisible();

  const sizeState = await page.evaluate(() => {
    const readerRoot = document.querySelector<HTMLElement>('[data-testid="reader-content"]');
    if (!readerRoot) {
      return { found: false, widthRatio: 0 };
    }

    const headingCandidates = Array.from(readerRoot.querySelectorAll<HTMLElement>('*'));
    const targetHeading = headingCandidates.find((entry) => {
      const text = (entry.textContent || '').replace(/\s+/g, ' ').trim().toUpperCase();
      return text === 'THE MATCHING PRINCIPLE';
    });

    if (!targetHeading) {
      return { found: false, widthRatio: 0 };
    }

    const images = Array.from(readerRoot.querySelectorAll<HTMLImageElement>('img'));
    const precedingImages = images.filter(
      (image) =>
        Boolean(image.getClientRects().length) &&
        Boolean(image.compareDocumentPosition(targetHeading) & Node.DOCUMENT_POSITION_FOLLOWING),
    );

    const openerImage = precedingImages.at(-1);
    if (!openerImage) {
      return { found: false, widthRatio: 0 };
    }

    const column = openerImage.closest<HTMLElement>('[data-testid="reader-page-column"]');
    if (!column) {
      return { found: false, widthRatio: 0 };
    }

    const imageRect = openerImage.getBoundingClientRect();
    const columnRect = column.getBoundingClientRect();
    if (!imageRect.width || !columnRect.width) {
      return { found: false, widthRatio: 0 };
    }

    return {
      found: true,
      widthRatio: imageRect.width / columnRect.width,
      openerSrc: openerImage.getAttribute('src') || '',
    };
  });

  expect(sizeState.found).toBeTruthy();
  expect(sizeState.widthRatio).toBeGreaterThan(0);
  expect(sizeState.widthRatio).toBeLessThanOrEqual(0.3);
  expect(sizeState.openerSrc).toMatch(/^data:image\//);
  expect(sizeState.openerSrc).not.toContain('&quot;reader-width:10&quot;');
});
