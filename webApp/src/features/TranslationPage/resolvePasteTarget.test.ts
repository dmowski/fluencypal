/** @jest-environment jsdom */

import { resolvePasteTargetLanguage, shouldInterceptDocumentPaste } from './resolvePasteTarget';

describe('resolvePasteTargetLanguage', () => {
  it('prefers focused, then hovered, then the first column', () => {
    expect(
      resolvePasteTargetLanguage({
        focusedLanguage: 'en',
        hoveredLanguage: 'pl',
        languages: ['ru', 'pl', 'en'],
      }),
    ).toBe('en');

    expect(
      resolvePasteTargetLanguage({
        focusedLanguage: null,
        hoveredLanguage: 'pl',
        languages: ['ru', 'pl', 'en'],
      }),
    ).toBe('pl');

    expect(
      resolvePasteTargetLanguage({
        focusedLanguage: null,
        hoveredLanguage: null,
        languages: ['ru', 'pl', 'en'],
      }),
    ).toBe('ru');
  });

  it('ignores focused or hovered languages that are no longer columns', () => {
    expect(
      resolvePasteTargetLanguage({
        focusedLanguage: 'de',
        hoveredLanguage: 'fr',
        languages: ['ru', 'pl', 'en'],
      }),
    ).toBe('ru');
  });
});

describe('shouldInterceptDocumentPaste', () => {
  it('intercepts paste outside form fields', () => {
    expect(shouldInterceptDocumentPaste(null)).toBe(true);
    expect(shouldInterceptDocumentPaste(document.body)).toBe(true);
  });

  it('does not steal paste from inputs and textareas', () => {
    const textarea = document.createElement('textarea');
    document.body.append(textarea);
    expect(shouldInterceptDocumentPaste(textarea)).toBe(false);

    const input = document.createElement('input');
    document.body.append(input);
    expect(shouldInterceptDocumentPaste(input)).toBe(false);

    textarea.remove();
    input.remove();
  });
});
