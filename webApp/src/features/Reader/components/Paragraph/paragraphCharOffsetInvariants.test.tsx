/** @jest-environment jsdom */

import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { ReaderParagraph } from './ReaderParagraph';

const renderParagraph = (words: string[], paragraphStartCharOffset = 0) =>
  render(
    <ReaderParagraph
      paragraphIndex={0}
      paragraphStartCharOffset={paragraphStartCharOffset}
      words={words}
      fontSize={20}
      lineHeight={1.5}
      justifyText={false}
      playText={() => {}}
      onSelection={() => {}}
      highlights={[]}
    />,
  );

const collectCharOffsets = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>('[data-char-offset]')).map((el) =>
    Number(el.getAttribute('data-char-offset')),
  );

const fixtures: Array<{ name: string; words: string[]; paragraphStartCharOffset?: number }> = [
  {
    name: 'plain text paragraph',
    words: ['Whenever', 'you', 'feel', 'like', 'criticizing', 'anyone'],
  },
  {
    name: 'paragraph with bold inline emphasis',
    words: ['I', 'have', '**never**', 'found', 'this', 'true'],
  },
  {
    name: 'paragraph with italic inline emphasis',
    words: ['He', 'said', '_remember_', 'this', 'always'],
  },
  {
    name: 'paragraph continued mid-text (non-zero start offset)',
    words: ['continued', 'paragraph', 'fragment', 'with', 'words'],
    paragraphStartCharOffset: 200,
  },
  {
    name: 'paragraph with smart quotes',
    words: ['She', 'whispered,', '“just', 'remember,', 'darling”', 'softly'],
  },
  {
    name: 'paragraph with em-dash and punctuation',
    words: ['Stop—', 'wait,', 'listen', 'carefully', 'now.'],
  },
];

describe('ReaderParagraph data-char-offset invariants', () => {
  fixtures.forEach(({ name, words, paragraphStartCharOffset = 0 }) => {
    describe(name, () => {
      it('emits unique data-char-offset values within the paragraph', () => {
        const { container } = renderParagraph(words, paragraphStartCharOffset);
        const offsets = collectCharOffsets(container);

        expect(offsets.length).toBeGreaterThan(0);
        expect(new Set(offsets).size).toBe(offsets.length);
      });

      it('emits monotonically non-decreasing data-char-offset values in DOM order', () => {
        const { container } = renderParagraph(words, paragraphStartCharOffset);
        const offsets = collectCharOffsets(container);

        for (let i = 1; i < offsets.length; i += 1) {
          expect(offsets[i]).toBeGreaterThanOrEqual(offsets[i - 1]);
        }
      });

      it('keeps every data-char-offset within 0 .. paragraphText.length (paragraph-relative)', () => {
        const { container } = renderParagraph(words, paragraphStartCharOffset);
        const offsets = collectCharOffsets(container);
        const paragraphText = words.join(' ');

        offsets.forEach((offset) => {
          expect(offset).toBeGreaterThanOrEqual(0);
          expect(offset).toBeLessThanOrEqual(paragraphText.length);
        });
      });
    });
  });
});
