import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getTranslation, normalizeToNativeLangCode } from '../../Translation/translationHelpers';
import { normalizeSelectedText } from '../components/Paragraph/libs/normalizeReaderSelectedText';
import { canTranslateReaderText } from '../components/Paragraph/libs/readerTextTranslationEligibility';
import { getHighlightAtCharRange } from '../components/Paragraph/libs/highlightColorAtCharOffset';
import { HighlightedText } from '../model/types';
import { ReaderParagraphSelectionPayload } from '../components/Paragraph/ReaderParagraph';
import { buildParagraphTokenMap } from '../components/Paragraph/libs/paragraphTokenMap';
import { reconcileSelection } from '../components/Paragraph/libs/selectionPipeline';
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
  userId,
  onApplyHighlight,
  onRemoveHighlight,
}: {
  sourceLanguage: string;
  targetLanguage: NativeLangCode | null;
  paragraphs: string[][];
  highlights: HighlightedText[];
  /** UID of the currently logged-in user, or undefined if anonymous. */
  userId?: string;
  onApplyHighlight: (highlight: HighlightedText) => void;
  onRemoveHighlight: (highlight: HighlightedText) => void;
}) => {
  const [activePopover, setActivePopover] = useState<ActivePopoverState | null>(null);
  const translationRequestIdRef = useRef(0);
  const popoverPaperRef = useRef<HTMLDivElement | null>(null);
  const activePopoverAtPointerDownRef = useRef<ActivePopoverState | null>(null);
  // Latest refs so `handleParagraphSelection` identity stays stable when the
  // user changes language or translate-to target. Keeping the callback stable
  // avoids re-rendering memoized `ReaderParagraph` children.
  const sourceLanguageRef = useRef(sourceLanguage);
  sourceLanguageRef.current = sourceLanguage;
  const targetLanguageRef = useRef(targetLanguage);
  targetLanguageRef.current = targetLanguage;

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

      activePopoverAtPointerDownRef.current = activePopover;
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

  const handleParagraphSelection = useCallback(async (payload: ReaderParagraphSelectionPayload) => {
    const closedPopover = activePopoverAtPointerDownRef.current;
    activePopoverAtPointerDownRef.current = null;
    if (
      closedPopover &&
      closedPopover.paragraphIndex === payload.paragraphIndex &&
      closedPopover.selection.startIndex === payload.selection.startIndex &&
      closedPopover.selection.endIndex === payload.selection.endIndex
    ) {
      // User clicked the already-selected word — unselect by not reopening
      window.getSelection()?.removeAllRanges();
      return;
    }

    const normalizedText = normalizeSelectedText(payload.selectionText);
    const normalizedSourceLanguage = normalizeToNativeLangCode(sourceLanguageRef.current);
    const currentTargetLanguage = targetLanguageRef.current;

    translationRequestIdRef.current += 1;
    const requestId = translationRequestIdRef.current;

    const shouldTranslate = canTranslateReaderText({
      text: normalizedText,
      sourceLanguage: normalizedSourceLanguage,
      targetLanguage: currentTargetLanguage,
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
        targetLanguage: currentTargetLanguage,
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
  }, []);

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
      const paragraphWords = paragraphs[activePopover.paragraphIndex] ?? [];
      const reconciled =
        paragraphWords.length && normalizedSelectionText
          ? reconcileSelection(
              {
                startInclusive: activePopover.selection.startIndex,
                endExclusive: activePopover.selection.endIndex + 1,
                text: normalizedSelectionText,
              },
              buildParagraphTokenMap(paragraphWords),
            )
          : null;

      const selectionForApply = reconciled
        ? {
            ...activePopover.selection,
            startIndex: reconciled.startInclusive,
            endIndex: reconciled.endExclusive - 1,
          }
        : activePopover.selection;

      applyHighlightColor({
        paragraphIndex: activePopover.paragraphIndex,
        startIndex: selectionForApply.startIndex,
        endIndex: selectionForApply.endIndex,
        color,
        userId,
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
      userId,
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
