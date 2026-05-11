import { HighlightedText } from '../model/types';
import { getHighlightAtCharRange } from '../components/Paragraph/libs/highlightColorAtCharOffset';

/**
 * Applies a color to the range [startIndex, endIndex] within a paragraph.
 *
 * Toggle behaviour: if the range already carries that exact color, the
 * highlight is removed instead of added.  Any other highlights that overlap
 * the range are also removed before the new one is written.
 */
export const applyHighlightColor = ({
  paragraphIndex,
  startIndex,
  endIndex,
  color,
  userId,
  paragraphHighlights,
  onApplyHighlight,
  onRemoveHighlight,
}: {
  paragraphIndex: number;
  startIndex: number;
  endIndex: number;
  color: string;
  /** The UID of the user creating the highlight, if logged in. */
  userId?: string;
  /** All highlights that belong to the same paragraph. */
  paragraphHighlights: HighlightedText[];
  onApplyHighlight: (highlight: HighlightedText) => void;
  onRemoveHighlight: (highlight: HighlightedText) => void;
}) => {
  const existingHighlight = getHighlightAtCharRange(startIndex, endIndex, paragraphHighlights);

  if (existingHighlight?.color === color) {
    onRemoveHighlight(existingHighlight);
    return;
  }

  const overlapping = paragraphHighlights.filter(
    (h) => h.startIndex < endIndex && h.endIndex > startIndex,
  );
  overlapping.forEach((h) => onRemoveHighlight(h));

  onApplyHighlight({ paragraphIndex, startIndex, endIndex, color, userId });
};
