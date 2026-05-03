import { HighlightedText } from '../model/types';

/** Returns the absolute character start offset of each word within `words.join(' ')`. */
export const getWordCharOffsets = (words: string[]): number[] => {
  const offsets: number[] = [];
  let pos = 0;
  for (const word of words) {
    offsets.push(pos);
    pos += word.length + 1; // +1 for the trailing space
  }
  return offsets;
};

/**
 * Resolves an absolute paragraph char offset from a Selection range endpoint.
 * Each character is rendered in its own span tagged with data-char-offset so
 * range.startOffset / endOffset (position within that single-char text node)
 * can be added directly to the span's base offset.
 */
export const getAbsoluteCharOffset = (
  node: Node | null,
  offsetWithinNode: number,
  wordCharOffsets: number[],
): number | null => {
  if (!node) return null;

  const findFirstCharElement = (entry: Node): Element | null => {
    if (entry instanceof Element) {
      if (entry.hasAttribute('data-char-offset')) {
        return entry;
      }
      return entry.querySelector('[data-char-offset]');
    }

    const parent = entry.parentElement;
    if (!parent) return null;
    const nextCharFromParent = parent.querySelector('[data-char-offset]');
    return nextCharFromParent;
  };

  const findLastCharElement = (entry: Node): Element | null => {
    if (entry instanceof Element) {
      if (entry.hasAttribute('data-char-offset')) {
        return entry;
      }
      const all = entry.querySelectorAll('[data-char-offset]');
      return all.length > 0 ? all[all.length - 1] : null;
    }

    const parent = entry.parentElement;
    if (!parent) return null;
    const all = parent.querySelectorAll('[data-char-offset]');
    return all.length > 0 ? all[all.length - 1] : null;
  };

  const element = node instanceof Element ? node : node.parentElement;
  if (!element) return null;

  const charEl = element.closest('[data-char-offset]');
  if (charEl) {
    const base = Number(charEl.getAttribute('data-char-offset'));
    return Number.isNaN(base) ? null : base + offsetWithinNode;
  }

  // Fallback: word-level (e.g. selection starts at the word span itself)
  const wordEl = element.closest('[data-word-index]');
  if (wordEl) {
    const wordIndex = Number(wordEl.getAttribute('data-word-index'));
    return Number.isNaN(wordIndex) ? null : wordCharOffsets[wordIndex] + offsetWithinNode;
  }

  if (node instanceof Element) {
    const childCount = node.childNodes.length;

    if (offsetWithinNode < childCount) {
      const nextNode = node.childNodes[offsetWithinNode];
      const firstChar = findFirstCharElement(nextNode);
      if (firstChar) {
        const base = Number(firstChar.getAttribute('data-char-offset'));
        return Number.isNaN(base) ? null : base;
      }
    }

    if (offsetWithinNode > 0 && childCount > 0) {
      const previousNode = node.childNodes[Math.min(offsetWithinNode - 1, childCount - 1)];
      const lastChar = findLastCharElement(previousNode);
      if (lastChar) {
        const base = Number(lastChar.getAttribute('data-char-offset'));
        return Number.isNaN(base) ? null : base + 1;
      }
    }
  }

  return null;
};

/** Returns the topmost highlight overlapping [charStart, charEnd] (inclusive). */
export const getHighlightAtCharRange = (
  charStart: number,
  charEnd: number,
  highlights: HighlightedText[],
): HighlightedText | null => {
  for (let i = highlights.length - 1; i >= 0; i -= 1) {
    const h = highlights[i];
    if (h.startIndex <= charEnd && h.endIndex >= charStart) return h;
  }
  return null;
};

/** Returns the highlight color for a single absolute character offset, or null. */
export const getCharHighlightColor = (
  absOffset: number,
  highlights: HighlightedText[],
): string | null => getHighlightAtCharRange(absOffset, absOffset, highlights)?.color ?? null;
