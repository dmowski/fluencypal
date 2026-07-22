/**
 * Collects plain text for all paragraphs currently shown in reader page columns.
 * Uses `data-words` on paragraph roots so speech matches source wording, not layout chrome.
 */
export const getVisibleReaderPageTextFromDom = (): string => {
  if (typeof document === 'undefined') return '';

  const columns = document.querySelectorAll('[data-testid="reader-page-column"]');
  const paragraphTexts: string[] = [];

  columns.forEach((column) => {
    column.querySelectorAll('[data-words]').forEach((paragraphEl) => {
      const words = paragraphEl.getAttribute('data-words')?.trim();
      if (words) {
        paragraphTexts.push(words);
      }
    });
  });

  return paragraphTexts.join('\n\n');
};
