/** @jest-environment jsdom */

import { renderHook } from '@testing-library/react';
import { useReaderHighlightItems } from './useReaderHighlightItems';
import type { PagedParagraph } from '../utils/splitParagraphsIntoPages';

describe('useReaderHighlightItems', () => {
  const paragraphs = [['Hello', 'world', 'foo', 'bar']];
  // "Hello world foo bar"
  // Hello: 0-4, world: 6-10, foo: 12-14, bar: 16-18
  const pages: PagedParagraph[][] = [
    [{ words: paragraphs[0], sourceParagraphIndex: 0, sourceStartCharOffset: 0 }],
  ];

  it('lists highlights in reverse document order (later highlights first)', () => {
    const highlights = [
      { paragraphIndex: 0, startIndex: 0, endIndex: 4, color: '#ffe066' },
      { paragraphIndex: 0, startIndex: 12, endIndex: 14, color: '#a0e7ff' },
    ];

    const { result } = renderHook(() =>
      useReaderHighlightItems({ highlights, paragraphs, pages }),
    );

    expect(result.current.map((item) => item.highlightedText)).toEqual(['foo', 'Hello']);
    expect(result.current.map((item) => item.color)).toEqual(['#a0e7ff', '#ffe066']);
  });

  it('keeps reverse order across paragraph boundaries', () => {
    const multiParagraphs = [
      ['Alpha', 'beta'],
      ['Gamma', 'delta'],
    ];
    const multiPages: PagedParagraph[][] = [
      [
        { words: multiParagraphs[0], sourceParagraphIndex: 0, sourceStartCharOffset: 0 },
        { words: multiParagraphs[1], sourceParagraphIndex: 1, sourceStartCharOffset: 0 },
      ],
    ];
    const highlights = [
      { paragraphIndex: 0, startIndex: 0, endIndex: 4, color: '#ffe066' },
      { paragraphIndex: 1, startIndex: 0, endIndex: 4, color: '#a0e7ff' },
    ];

    const { result } = renderHook(() =>
      useReaderHighlightItems({
        highlights,
        paragraphs: multiParagraphs,
        pages: multiPages,
      }),
    );

    expect(result.current.map((item) => item.highlightedText)).toEqual(['Gamma', 'Alpha']);
  });
});
