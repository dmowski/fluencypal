/**
 * Plain text for the currently visible reader spread, from rendered DOM.
 */
export const getVisibleReaderPageTextFromDom = (): string => {
  if (typeof document === 'undefined') return '';

  const contentEl = document.querySelector('.reader-content');
  if (!(contentEl instanceof HTMLElement)) return '';

  return (contentEl.innerText ?? '').trim();
};

/** Waits until `.reader-content` has text or attempts are exhausted (e.g. after pagination). */
export const waitForVisibleReaderPageTextFromDom = (
  maxAttempts = 20,
): Promise<string> => {
  return new Promise((resolve) => {
    const read = (attempt: number) => {
      const text = getVisibleReaderPageTextFromDom();
      if (text.length > 0 || attempt >= maxAttempts) {
        resolve(text);
        return;
      }
      requestAnimationFrame(() => read(attempt + 1));
    };
    read(0);
  });
};
