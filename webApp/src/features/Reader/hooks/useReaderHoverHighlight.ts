import { useCallback, useEffect, useRef } from 'react';
import { HighlightedText } from '../model/types';
import { ReaderParagraphHoverPayload } from '../components/Paragraph/ReaderParagraph';
import { COLOR_SHORTCUTS } from '../components/TextPopover';
import { applyHighlightColor } from '../utils/applyHighlightColor';

export const useReaderHoverHighlight = ({
  highlights,
  onApplyHighlight,
  onRemoveHighlight,
  isPopoverOpen,
}: {
  highlights: HighlightedText[];
  onApplyHighlight: (highlight: HighlightedText) => void;
  onRemoveHighlight: (highlight: HighlightedText) => void;
  isPopoverOpen: boolean;
}) => {
  const hoveredWordRef = useRef<ReaderParagraphHoverPayload | null>(null);
  const highlightsRef = useRef(highlights);
  highlightsRef.current = highlights;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!hoveredWordRef.current) return;
      if (isPopoverOpen) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;

      const color = Object.entries(COLOR_SHORTCUTS).find(
        ([, shortcut]) => `Key${shortcut}` === event.code,
      )?.[0];
      if (!color) return;

      event.preventDefault();
      const { paragraphIndex, startIndex, endIndex } = hoveredWordRef.current;
      const paragraphHighlights = highlightsRef.current.filter(
        (h) => (h.paragraphIndex ?? 0) === paragraphIndex,
      );

      applyHighlightColor({
        paragraphIndex,
        startIndex,
        endIndex,
        color,
        paragraphHighlights,
        onApplyHighlight,
        onRemoveHighlight,
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onApplyHighlight, onRemoveHighlight, isPopoverOpen]);

  const onWordHoverInfo = useCallback((payload: ReaderParagraphHoverPayload) => {
    hoveredWordRef.current = payload;
  }, []);

  const clearHoveredWord = useCallback(() => {
    hoveredWordRef.current = null;
  }, []);

  return { onWordHoverInfo, clearHoveredWord };
};
