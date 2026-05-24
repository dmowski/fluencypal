import { expect, test } from 'vitest';
import { render } from 'vitest-browser-react';
import { page, userEvent } from 'vitest/browser';
import { ReaderParagraph, type ReaderParagraphSelectionPayload } from './ReaderParagraph';
import { ReaderSettings } from '../../model/types';
import {
  splitIntoPages,
  splitTextIntoParagraphs,
  type PagedParagraph,
} from '../../utils/splitParagraphsIntoPages';

// Source text (words.join(' ')): '- **Finally, experiment.** Tell a joke.'
//
// Char offsets (0-based):
//   '-'           @ 0
//   ' '           @ 1
//   '**'          @ 2–3
//   'Finally,'    @ 4–11   (F=4 … ,=11)
//   ' '           @ 12
//   'experiment.' @ 13–23
//   '**'          @ 24–25
//   ' '           @ 26
//   'Tell'        @ 27–30
//   ' '           @ 31
//   'a'           @ 32
//   ' '           @ 33
//   'joke.'       @ 34–38
const LI_WORDS = ['-', '**Finally,', 'experiment.**', 'Tell', 'a', 'joke.'];

function defaultProps(onSelection: (p: ReaderParagraphSelectionPayload) => void = () => {}) {
  return {
    paragraphIndex: 0,
    paragraphStartCharOffset: 0,
    words: LI_WORDS,
    fontSize: 20,
    lineHeight: 1.5,
    justifyText: false as const,
    playText: () => {},
    onSelection,
    highlights: [],
  };
}

/** Find the word anchor element whose trimmed textContent equals `text`. */
function findWordAnchor(container: Element, text: string) {
  return (
    Array.from(container.querySelectorAll<HTMLElement>('[data-reader-word-anchor="true"]')).find(
      (el) => el.textContent?.trim() === text,
    ) ?? null
  );
}

// ---------------------------------------------------------------------------
// DOM structure diagnostic: verify that markdown-to-jsx does NOT wrap li
// content in a <p> tag (which would cause the p-override to fire with
// startWordIndex=0 before the li-override fires with startWordIndex=1, making
// "Finally,"→0, "experiment."→1, "Tell"→2 and therefore
// renderableTokens[2].sourceStart=13 → "expe" highlighted when clicking "Tell").
// ---------------------------------------------------------------------------

test('li paragraph – no <p> wrapper inside <li> (forceBlock must not inject p)', async () => {
  const { container } = await render(<ReaderParagraph {...defaultProps()} />);

  const liEl = container.querySelector('li');
  expect(liEl, '<li> element not found').not.toBeNull();

  const pInsideLi = liEl!.querySelector('p');
  expect(
    pInsideLi,
    '<p> found inside <li>: forceBlock is wrapping list-item content, causing the p-override to assign wrong wordIndex values',
  ).toBeNull();
});

// ---------------------------------------------------------------------------
// Render-layer: verify the renderer assigns the correct data-word-index to
// each visible word. If data-word-index is off-by-one the renderableTokens
// lookup returns the wrong sourceStart even when the token map is correct.
// ---------------------------------------------------------------------------

test('li paragraph – each word carries the correct data-word-index (render layer)', async () => {
  const { container } = await render(<ReaderParagraph {...defaultProps()} />);

  const expectations: [string, number][] = [
    ['Finally,', 1],
    ['experiment.', 2],
    ['Tell', 3],
    ['a', 4],
    ['joke.', 5],
  ];

  for (const [word, expectedIndex] of expectations) {
    const el = findWordAnchor(container, word);
    expect(el, `"${word}" word element not found`).not.toBeNull();
    expect(Number(el!.getAttribute('data-word-index')), `"${word}" has wrong data-word-index`).toBe(
      expectedIndex,
    );
  }
});

// ---------------------------------------------------------------------------
// Attribute tests: the token map must produce the correct source-start offsets
// for every word in a list-item paragraph that contains bold text with an
// embedded comma (e.g. "**Finally,").
// ---------------------------------------------------------------------------

test('li paragraph – "Finally," word span has source-start 4', async () => {
  const { container } = await render(<ReaderParagraph {...defaultProps()} />);

  const el = findWordAnchor(container, 'Finally,');
  expect(el, '"Finally," word element not found').not.toBeNull();
  expect(el!.getAttribute('data-reader-token-source-start')).toBe('4');
});

test('li paragraph – "experiment." word span has source-start 13', async () => {
  const { container } = await render(<ReaderParagraph {...defaultProps()} />);

  const el = findWordAnchor(container, 'experiment.');
  expect(el, '"experiment." word element not found').not.toBeNull();
  expect(el!.getAttribute('data-reader-token-source-start')).toBe('13');
});

test('li paragraph – "Tell" word span has source-start 27', async () => {
  const { container } = await render(<ReaderParagraph {...defaultProps()} />);

  const el = findWordAnchor(container, 'Tell');
  expect(el, '"Tell" word element not found').not.toBeNull();
  expect(el!.getAttribute('data-reader-token-source-start')).toBe('27');
});

test('li paragraph – "Tell" char spans carry correct absolute offsets (27–30)', async () => {
  const { container } = await render(<ReaderParagraph {...defaultProps()} />);

  const tellEl = findWordAnchor(container, 'Tell');
  expect(tellEl, '"Tell" word element not found').not.toBeNull();

  const charOffsets = Array.from(tellEl!.querySelectorAll<HTMLElement>('[data-char-offset]')).map(
    (s) => Number(s.getAttribute('data-char-offset')),
  );

  expect(charOffsets).toEqual([27, 28, 29, 30]);
});

// ---------------------------------------------------------------------------
// Interaction test: clicking "Tell" must emit a selection anchored at the
// correct source-text position.
// ---------------------------------------------------------------------------

test('li paragraph – clicking "Tell" emits selection at source offsets 27–30', async () => {
  const selections: ReaderParagraphSelectionPayload[] = [];
  const result = await render(<ReaderParagraph {...defaultProps((p) => selections.push(p))} />);

  // getByText returns a Playwright Locator; userEvent.click drives it via the
  // browser provider so the full onClick chain fires including handleWordClick.
  const tellLocator = result.getByText('Tell');
  await userEvent.click(tellLocator);

  expect(selections.length).toBeGreaterThan(0);
  const { selection } = selections[0];
  // paragraphStartCharOffset=0, so highlight indices equal paragraph-local offsets.
  expect(selection.startIndex).toBe(27);
  expect(selection.endIndex).toBe(30);
});

// ---------------------------------------------------------------------------
// REGRESSION (real Supercommunicators paragraph): the user-reported bug
// surfaces on the LONG list paragraph that begins with bold "Finally,
// experiment." Clicking "Tell" highlighted "expe" because the renderer's
// wordIndex was off-by-+1 versus renderableTokens.
//
// This is the exact words[] array dumped from the real reader (book
// `supercommunicators`, chapter 4 around page 75) via the debug bridge.
// Source: e2e/fixtures/Supercommunicators.epub (parsed by epubImport →
// `- **Finally, experiment.** Tell a joke. Ask an unexpected question. …`).
// ---------------------------------------------------------------------------

const LONG_LI_WORDS = [
  '-',
  '**Finally,',
  'experiment.**',
  'Tell',
  'a',
  'joke.',
  'Ask',
  'an',
  'unexpected',
  'question.',
  'Introduce',
  'a',
  'new',
  'idea.',
  'Try',
  'interrupting,',
  'and',
  'then',
  'not',
  'interrupting.',
  'Watch',
  'to',
  'see',
  'if',
  'your',
  'companions',
  'play',
  'along.',
  'If',
  'they',
  'do,',
  'they\u2019re',
  'hinting',
  'at',
  'how',
  'they',
  'want',
  'to',
  'make',
  'decisions',
  'together,',
  'the',
  'rules',
  'and',
  'norms',
  'they',
  'accept.',
  'They',
  'are',
  'signaling',
  'how',
  'they\u2019d',
  'like',
  'this',
  'conversation',
  'to',
  'unfold.',
];

function longProps(onSelection: (p: ReaderParagraphSelectionPayload) => void = () => {}) {
  return {
    paragraphIndex: 0,
    paragraphStartCharOffset: 0,
    words: LONG_LI_WORDS,
    fontSize: 20,
    lineHeight: 1.5,
    justifyText: false as const,
    playText: () => {},
    onSelection,
    highlights: [],
  };
}

// Source-text positions (words.join(' ')):
//   '-'              @ 0
//   '**Finally,'     @ 2   (Finally, inner-word @ 4)
//   'experiment.**'  @ 13  (experiment. inner-word @ 13)
//   'Tell'           @ 27
//   'a'              @ 32
//   'joke.'          @ 34
//   'Ask'            @ 40
//   'an'             @ 44
const LONG_EXPECTED_SOURCE_STARTS: Array<[string, number]> = [
  ['Finally,', 4],
  ['experiment.', 13],
  ['Tell', 27],
  ['a', 32],
  ['joke.', 34],
  ['Ask', 40],
  ['an', 44],
];

test('REPRO long-li paragraph – no <p> wrapper inside <li>', async () => {
  const { container } = await render(<ReaderParagraph {...longProps()} />);
  const liEl = container.querySelector('li');
  expect(liEl, '<li> not found').not.toBeNull();
  const pInsideLi = liEl!.querySelector('p');
  expect(
    pInsideLi,
    '<p> found inside <li>: forceBlock injected a paragraph wrapper, shifting wordIndex',
  ).toBeNull();
});

test('REPRO long-li paragraph – data-word-index for each visible word is sequential from 1', async () => {
  const { container } = await render(<ReaderParagraph {...longProps()} />);

  const expectations: [string, number][] = [
    ['Finally,', 1],
    ['experiment.', 2],
    ['Tell', 3],
    ['a', 4],
    ['joke.', 5],
    ['Ask', 6],
    ['an', 7],
  ];

  for (const [word, expectedIndex] of expectations) {
    const el = findWordAnchor(container, word);
    expect(el, `"${word}" not found`).not.toBeNull();
    expect(Number(el!.getAttribute('data-word-index')), `"${word}" has wrong data-word-index`).toBe(
      expectedIndex,
    );
  }
});

test('REPRO long-li paragraph – every visible word has correct data-reader-token-source-start', async () => {
  const { container } = await render(<ReaderParagraph {...longProps()} />);

  for (const [word, expectedStart] of LONG_EXPECTED_SOURCE_STARTS) {
    const el = findWordAnchor(container, word);
    expect(el, `"${word}" not found`).not.toBeNull();
    expect(
      el!.getAttribute('data-reader-token-source-start'),
      `"${word}" sourceStart wrong (off-by-+1 means renderer indexed past its source token)`,
    ).toBe(String(expectedStart));
  }
});

test('REPRO long-li paragraph – clicking "Tell" emits selection at source 27–30 (NOT "expe" @ 13–17)', async () => {
  const selections: ReaderParagraphSelectionPayload[] = [];
  const result = await render(<ReaderParagraph {...longProps((p) => selections.push(p))} />);

  const tellLocator = result.getByText('Tell', { exact: true });
  await userEvent.click(tellLocator);

  expect(selections.length).toBeGreaterThan(0);
  const { selection } = selections[0];
  expect(
    selection.startIndex,
    'startIndex 13 would highlight "expe" (the bug); 27 is the correct "Tell" position',
  ).toBe(27);
  expect(selection.endIndex).toBe(30);
});

// ---------------------------------------------------------------------------
// Italic span split across pages: documents that the paginator rebalances
// markdown emphasis across the page boundary (no literal "_" leaks).
// Reproduces DevPanel Split tab defaults.
// ---------------------------------------------------------------------------

const SPLIT_ITALIC_TEST_TEXT =
  'Force a page break across the italic span normal normal normal text _long paragraph italic text_ and more words to force a page break across the italic span';

const SPLIT_ITALIC_PAGINATION_SETTINGS: ReaderSettings = {
  language: 'en-US',
  selectedVoiceURI: null,
  translateToLanguage: null,
  fontSize: 36,
  lineHeight: 1.5,
  justifyText: false,
  translateOnHover: false,
  voiceOverSelectedText: false,
  contentWidth: 400,
  contentHeight: 200,
  paragraphGap: 20,
  columns: 1,
  columnGap: 40,
};

const splitItalicTestPages = () =>
  splitIntoPages({
    bookParagraphs: splitTextIntoParagraphs(SPLIT_ITALIC_TEST_TEXT),
    settings: SPLIT_ITALIC_PAGINATION_SETTINGS,
  });

const SplitItalicPagesFixture = ({ pages }: { pages: PagedParagraph[][] }) => (
  <div
    data-testid="italic-split-pages-fixture"
    style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      padding: '8px',
      backgroundColor: '#fff',
    }}
  >
    {pages.map((pageParagraphs, pageIndex) => (
      <div
        key={pageIndex}
        data-testid={`split-page-${pageIndex}`}
        style={{
          width: `${SPLIT_ITALIC_PAGINATION_SETTINGS.contentWidth}px`,
          height: `${SPLIT_ITALIC_PAGINATION_SETTINGS.contentHeight}px`,
          overflow: 'hidden',
          backgroundColor: '#F4E1C6',
          color: '#000',
          padding: '8px 0',
          display: 'flex',
          flexDirection: 'column',
          gap: `${SPLIT_ITALIC_PAGINATION_SETTINGS.paragraphGap}px`,
        }}
      >
        {pageParagraphs.map((paragraph) => (
          <ReaderParagraph
            key={`${paragraph.sourceParagraphIndex}-${paragraph.sourceStartCharOffset}`}
            paragraphIndex={paragraph.sourceParagraphIndex}
            paragraphStartCharOffset={paragraph.sourceStartCharOffset}
            words={paragraph.words}
            markdownPrefix={paragraph.markdownPrefix}
            markdownSuffix={paragraph.markdownSuffix}
            fontSize={SPLIT_ITALIC_PAGINATION_SETTINGS.fontSize}
            lineHeight={SPLIT_ITALIC_PAGINATION_SETTINGS.lineHeight}
            justifyText={SPLIT_ITALIC_PAGINATION_SETTINGS.justifyText}
            playText={() => {}}
            onSelection={() => {}}
            highlights={[]}
          />
        ))}
      </div>
    ))}
  </div>
);

test('italic paragraph split – pagination produces exactly two pages', () => {
  const pages = splitItalicTestPages();
  expect(pages.length).toBe(2);
});

test('italic paragraph split – screenshot shows balanced italic on both pages', async () => {
  const pages = splitItalicTestPages();
  expect(pages.length).toBe(2);

  await render(<SplitItalicPagesFixture pages={pages} />);

  await expect
    .element(page.getByTestId('italic-split-pages-fixture'))
    .toMatchScreenshot('italic-split-across-pages');
});
