/**
 * Plain text for the currently visible reader spread, from rendered DOM.
 */
export const getVisibleReaderPageTextFromDom = (): string => {
  if (typeof document === 'undefined') return '';

  const contentEl = document.querySelector('.reader-content');
  if (!(contentEl instanceof HTMLElement)) return '';

  return (contentEl.innerText ?? '').trim();
};
