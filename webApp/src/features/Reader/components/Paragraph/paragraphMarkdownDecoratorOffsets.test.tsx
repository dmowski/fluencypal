/** @jest-environment jsdom */

import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ReaderParagraph } from './ReaderParagraph';

/**
 * Regression coverage: when a paragraph contains an inline emphasis run wrapped
 * in `_..._` that is surrounded by punctuation such as `(_Do they seem
 * negative or positive?_)`, the markdown renderer emits the leading `(` as its
 * own visible word.  The source-word list (split by spaces on the raw markdown
 * text), however, keeps `(_Do` as a single token.  Historically this caused
 * the renderer's visible-word counter and the source-word index to drift,
 * which made `data-char-offset` values on every visible char inside the
 * emphasis block point at the wrong source character.  In particular, dragging
 * to highlight the word `negative` ended up highlighting `seem` because the
 * char-offsets resolved to the source range of an earlier word.
 *
 * The invariant we enforce here: every visible character span must carry a
 * `data-char-offset` whose value matches the index of that same character in
 * `words.join(' ')`.
 */

const renderParagraph = (words: string[]) =>
  render(
    <ReaderParagraph
      paragraphIndex={0}
      paragraphStartCharOffset={0}
      words={words}
      fontSize={20}
      lineHeight={1.5}
      justifyText={false}
      playText={() => {}}
      onSelection={() => {}}
      highlights={[]}
    />,
  );

const collectVisibleCharOffsetMap = (container: HTMLElement) => {
  const paragraphText = container
    .querySelector<HTMLElement>('[data-reader-paragraph-start-offset]')
    ?.getAttribute('data-words');
  if (!paragraphText) {
    throw new Error('paragraph root not found');
  }
  return Array.from(container.querySelectorAll<HTMLElement>('[data-char-offset]'))
    .filter((entry) => entry.getAttribute('data-reader-token-kind') !== 'space')
    .map((entry) => ({
      char: entry.textContent ?? '',
      offset: Number(entry.getAttribute('data-char-offset')),
      paragraphText,
    }));
};

describe('ReaderParagraph emphasis decorator inside punctuation', () => {
  // The failing reproduction: minimal subset that contains the exact pattern
  // the user reported. Keeping it focused makes the bug location obvious.
  const minimalWords = ['mood', '(_Do', 'they', 'seem', 'negative', 'or', 'positive?_)', 'and'];

  it('keeps every visible char anchored to its true source offset (minimal repro)', () => {
    const { container } = renderParagraph(minimalWords);
    const entries = collectVisibleCharOffsetMap(container);

    entries.forEach(({ char, offset, paragraphText }) => {
      expect(paragraphText[offset]).toBe(char);
    });
  });

  it('keeps every visible char anchored to its true source offset (full reported paragraph)', () => {
    const fullWords = [
      'So',
      'instead',
      'of',
      'trying',
      'to',
      'decipher',
      'specific',
      'emotions,',
      'pay',
      'attention',
      'to',
      'someone\u2019s',
      'mood',
      '(_Do',
      'they',
      'seem',
      'negative',
      'or',
      'positive?_)',
      'and',
      'their',
      'energy',
      'level',
      '(_Are',
      'they',
      'high',
      'energy',
      'or',
      'low',
      'energy?_).',
      'Then,',
      'focus',
      'on',
      'matching',
      'those',
      'two',
      'attributes\u2014',
      'or,',
      'if',
      'matching',
      'will',
      'only',
      'exacerbate',
      'tensions,',
      'show',
      'that',
      'you',
      'hear',
      'their',
      'emotions',
      'by',
      'acknowledging',
      'how',
      'they',
      'feel.',
    ];

    const { container } = renderParagraph(fullWords);
    const entries = collectVisibleCharOffsetMap(container);

    entries.forEach(({ char, offset, paragraphText }) => {
      expect(paragraphText[offset]).toBe(char);
    });
  });
});
