import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getTranslation, normalizeToNativeLangCode } from '../../Translation/translationHelpers';
import { normalizeSelectedText } from '../components/Paragraph/libs/normalizeReaderSelectedText';
import { canTranslateReaderText } from '../components/Paragraph/libs/readerTextTranslationEligibility';
import { getHighlightAtCharRange } from '../components/Paragraph/libs/highlightColorAtCharOffset';
import { HighlightedText } from '../model/types';
import { ReaderParagraphSelectionPayload } from '../components/Paragraph/ReaderParagraph';
import { reconcileSelectionOffsets } from '../components/Paragraph/libs/selectionOffsetReconciliation';
import { NativeLangCode } from '@/libs/language/type';
import { applyHighlightColor } from '../utils/applyHighlightColor';

interface ActivePopoverState {
  paragraphIndex: number;
  selection: HighlightedText;
  selectionText: string;
  anchorPosition: {
    top: number;
    left: number;
  };
  translatedText: string | null;
  isTranslationLoading: boolean;
}

export const useReaderHighlightPopover = ({
  sourceLanguage,
  targetLanguage,
  paragraphs,
  highlights,
  onApplyHighlight,
  onRemoveHighlight,
}: {
  sourceLanguage: string;
  targetLanguage: NativeLangCode | null;
  paragraphs: string[][];
  highlights: HighlightedText[];
  onApplyHighlight: (highlight: HighlightedText) => void;
  onRemoveHighlight: (highlight: HighlightedText) => void;
}) => {
  const [activePopover, setActivePopover] = useState<ActivePopoverState | null>(null);
  const translationRequestIdRef = useRef(0);
  const popoverPaperRef = useRef<HTMLDivElement | null>(null);

  const closeActivePopover = useCallback(() => {
    translationRequestIdRef.current += 1;
    setActivePopover(null);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!activePopover) return;

      const target = event.target as Node | null;
      if (!target) return;

      if (popoverPaperRef.current?.contains(target)) {
        return;
      }

      closeActivePopover();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!activePopover) return;
      if (event.key !== 'Escape') return;

      closeActivePopover();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activePopover, closeActivePopover]);

  const handleParagraphSelection = useCallback(
    async (payload: ReaderParagraphSelectionPayload) => {
      const normalizedText = normalizeSelectedText(payload.selectionText);
      const normalizedSourceLanguage = normalizeToNativeLangCode(sourceLanguage);

      translationRequestIdRef.current += 1;
      const requestId = translationRequestIdRef.current;

      const shouldTranslate = canTranslateReaderText({
        text: normalizedText,
        sourceLanguage: normalizedSourceLanguage,
        targetLanguage,
      });

      setActivePopover({
        paragraphIndex: payload.paragraphIndex,
        selection: payload.selection,
        selectionText: payload.selectionText,
        anchorPosition: payload.anchorPosition,
        translatedText: null,
        isTranslationLoading: shouldTranslate,
      });

      if (!shouldTranslate) {
        return;
      }

      try {
        const translated = await getTranslation({
          text: normalizedText,
          sourceLanguage: normalizedSourceLanguage,
          targetLanguage,
        });

        if (translationRequestIdRef.current !== requestId) {
          return;
        }

        setActivePopover((previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            translatedText: translated.trim() || null,
            isTranslationLoading: false,
          };
        });
      } catch {
        if (translationRequestIdRef.current !== requestId) {
          return;
        }

        setActivePopover((previous) => {
          if (!previous) return previous;
          return {
            ...previous,
            translatedText: null,
            isTranslationLoading: false,
          };
        });
      }
    },
    [sourceLanguage, targetLanguage],
  );

  const activeParagraphHighlights = useMemo(() => {
    if (!activePopover) {
      return [];
    }

    return highlights.filter(
      (highlight) => (highlight.paragraphIndex ?? 0) === activePopover.paragraphIndex,
    );
  }, [activePopover, highlights]);

  const activeColor = useMemo(() => {
    if (!activePopover) return undefined;

    return getHighlightAtCharRange(
      activePopover.selection.startIndex,
      activePopover.selection.endIndex,
      activeParagraphHighlights,
    )?.color;
  }, [activeParagraphHighlights, activePopover]);

  const handleActiveColorSelect = useCallback(
    (color: string) => {
      if (!activePopover) return;

      const normalizedSelectionText = normalizeSelectedText(activePopover.selectionText);
      const paragraphText = (paragraphs[activePopover.paragraphIndex] ?? []).join(' ');
      const reconciledSelection =
        paragraphText && normalizedSelectionText
          ? reconcileSelectionOffsets({
              paragraphText,
              selectedText: normalizedSelectionText,
              rawStart: activePopover.selection.startIndex,
              rawEnd: activePopover.selection.endIndex + 1,
            })
          : null;

      const isSingleWordSelection = !/\s/u.test(normalizedSelectionText);
      const singleWordClampedSelection = (() => {
        if (!isSingleWordSelection || !normalizedSelectionText.length) {
          return null;
        }

        if (paragraphText.length > 0) {
          const occurrences: number[] = [];
          const lowerParagraph = paragraphText.toLowerCase();
          const lowerSelection = normalizedSelectionText.toLowerCase();
          let cursor = 0;

          while (cursor <= lowerParagraph.length) {
            const foundAt = lowerParagraph.indexOf(lowerSelection, cursor);
            if (foundAt < 0) {
              break;
            }
            occurrences.push(foundAt);
            cursor = foundAt + 1;
          }

          if (occurrences.length > 0) {
            const nearestStart = occurrences.reduce((best, current) =>
              Math.abs(current - activePopover.selection.startIndex) <
              Math.abs(best - activePopover.selection.startIndex)
                ? current
                : best,
            );

            return {
              startInclusive: nearestStart,
              endExclusive: Math.min(
                nearestStart + normalizedSelectionText.length,
                paragraphText.length,
              ),
            };
          }
        }

        const fallbackStart = activePopover.selection.startIndex;
        return {
          startInclusive: fallbackStart,
          endExclusive: fallbackStart + normalizedSelectionText.length,
        };
      })();

      const correctedSelection = singleWordClampedSelection ?? reconciledSelection;

      const selectionForApply = correctedSelection
        ? {
            ...activePopover.selection,
            startIndex: correctedSelection.startInclusive,
            endIndex: correctedSelection.endExclusive - 1,
          }
        : activePopover.selection;

      applyHighlightColor({
        paragraphIndex: activePopover.paragraphIndex,
        startIndex: selectionForApply.startIndex,
        endIndex: selectionForApply.endIndex,
        color,
        paragraphHighlights: activeParagraphHighlights,
        onApplyHighlight,
        onRemoveHighlight,
      });

      window.getSelection()?.removeAllRanges();
      closeActivePopover();
    },
    [
      activeParagraphHighlights,
      activePopover,
      closeActivePopover,
      onApplyHighlight,
      onRemoveHighlight,
      paragraphs,
    ],
  );

  return {
    activePopover,
    activeColor,
    popoverPaperRef,
    closeActivePopover,
    handleParagraphSelection,
    handleActiveColorSelect,
  };
};
