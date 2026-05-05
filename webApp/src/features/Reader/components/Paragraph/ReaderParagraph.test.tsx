/** @jest-environment jsdom */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { ReaderParagraph } from './ReaderParagraph';

describe('ReaderParagraph', () => {
  it('renders markdown bold spans instead of literal markers', () => {
    const { container } = render(
      <ReaderParagraph
        paragraphIndex={0}
        paragraphStartCharOffset={0}
        words={['**Title**:', 'Pride', 'and', 'Prejudice']}
        fontSize={20}
        lineHeight={1.5}
        justifyText={false}
        playText={() => {}}
        onSelection={() => {}}
        highlights={[]}
      />,
    );

    const boldTitle = container.querySelector('strong');

    expect(boldTitle).toBeInTheDocument();
    expect(boldTitle).toHaveTextContent('Title');
    expect(container).not.toHaveTextContent('**Title**');
    expect(container).toHaveTextContent('Title: Pride and Prejudice');
  });
});