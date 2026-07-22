/** @jest-environment jsdom */
import { getVisibleReaderPageTextFromDom } from './getVisibleReaderPageTextFromDom';

describe('getVisibleReaderPageTextFromDom', () => {
  it('joins paragraph data-words from visible page columns', () => {
    document.body.innerHTML = `
      <div data-testid="reader-page-column">
        <div data-words="First paragraph."></div>
        <div data-words="Second paragraph."></div>
      </div>
      <div data-testid="reader-page-column">
        <div data-words="Third paragraph."></div>
      </div>
    `;

    expect(getVisibleReaderPageTextFromDom()).toBe(
      'First paragraph.\n\nSecond paragraph.\n\nThird paragraph.',
    );
  });

  it('returns empty string when no reader columns are mounted', () => {
    document.body.innerHTML = '';
    expect(getVisibleReaderPageTextFromDom()).toBe('');
  });
});
