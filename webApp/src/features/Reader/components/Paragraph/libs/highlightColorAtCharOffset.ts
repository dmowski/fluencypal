import { HighlightedText } from '../../../model/types';

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
