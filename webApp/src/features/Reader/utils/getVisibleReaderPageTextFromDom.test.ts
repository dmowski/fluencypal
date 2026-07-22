/** @jest-environment jsdom */
import { getVisibleReaderPageTextFromDom } from './getVisibleReaderPageTextFromDom';

describe('getVisibleReaderPageTextFromDom', () => {
  it('returns trimmed innerText from .reader-content', () => {
    const content = document.createElement('div');
    content.className = 'reader-content';
    Object.defineProperty(content, 'innerText', {
      value: '  First paragraph.\n\nSecond paragraph.  ',
    });
    document.body.appendChild(content);

    expect(getVisibleReaderPageTextFromDom()).toBe('First paragraph.\n\nSecond paragraph.');
  });

  it('returns empty string when .reader-content is missing', () => {
    document.body.innerHTML = '';
    expect(getVisibleReaderPageTextFromDom()).toBe('');
  });
});
