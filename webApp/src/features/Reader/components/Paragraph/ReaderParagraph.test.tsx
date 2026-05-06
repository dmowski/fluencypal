/** @jest-environment jsdom */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ReaderParagraph } from './ReaderParagraph';
import { PARAGRAPH_TEXT_INDENT } from '../../utils/readerParagraphFormatting';

const renderReaderParagraph = ({
  words,
  paragraphStartCharOffset = 0,
}: {
  words: string[];
  paragraphStartCharOffset?: number;
}) =>
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

describe('ReaderParagraph', () => {
  it('renders markdown bold spans instead of literal markers', () => {
    const { container } = renderReaderParagraph({
      words: ['**Title**:', 'Pride', 'and', 'Prejudice'],
    });

    const boldTitle = container.querySelector('strong');

    expect(boldTitle).toBeInTheDocument();
    expect(boldTitle).toHaveTextContent('Title');
    expect(container).not.toHaveTextContent('**Title**');
    expect(container).toHaveTextContent('Title: Pride and Prejudice');
  });

  it('applies a first-line indent for regular paragraphs', () => {
    const { container } = renderReaderParagraph({
      words: ['Whenever', 'you', 'feel', 'like', 'criticizing'],
    });

    const paragraphRoot = container.querySelector('.MuiTypography-root');

    expect(paragraphRoot).toBeInTheDocument();
    expect(window.getComputedStyle(paragraphRoot as Element).textIndent).toBe(
      PARAGRAPH_TEXT_INDENT,
    );
  });

  it('does not indent paragraph fragments continued on a new page', () => {
    const { container } = renderReaderParagraph({
      words: ['continued', 'paragraph', 'text'],
      paragraphStartCharOffset: 24,
    });

    const paragraphRoot = container.querySelector('.MuiTypography-root');

    expect(paragraphRoot).toBeInTheDocument();
    expect(window.getComputedStyle(paragraphRoot as Element).textIndent).toBe('0');
  });

  it('does not indent block markdown paragraphs', () => {
    const { container } = renderReaderParagraph({ words: ['#', 'Chapter', 'One'] });

    const paragraphRoot = container.querySelector('.MuiTypography-root');

    expect(paragraphRoot).toBeInTheDocument();
    expect(window.getComputedStyle(paragraphRoot as Element).textIndent).toBe('0');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Chapter One');
  });
});
