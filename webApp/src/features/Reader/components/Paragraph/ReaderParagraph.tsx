import { Stack, Typography } from '@mui/material';
import { memo, MouseEvent, useMemo, useRef } from 'react';
import { createSelectionFromRange } from './libs/selectionHighlightRange';
import { getAbsoluteCharOffset, getRangeCharOffsets } from './libs/absoluteCharOffsetFromDomPoint';
import { getWordCharOffsets } from './libs/selectionOffsetFromWordList';
import { normalizeSelectedText } from './libs/normalizeReaderSelectedText';
import { HighlightedText } from '../../model/types';
import { ReaderMarkdown } from './ReaderMarkdown';
import { getPopoverPositionFromRect } from './libs/popoverAnchorPosition';
import { getSafeWordMeta } from './libs/wordIndexSafeMeta';
import { reconcileSelectionOffsets } from './libs/selectionOffsetReconciliation';
import {
  applyNativeSelectionByOffsets,
  applyNativeSelectionByText,
  applyNativeSelectionForWordElement,
} from './libs/selectionDomRestore';
import { getCharHighlightColor as getCharColorAtOffset } from './libs/highlightColorAtCharOffset';

export interface ReaderParagraphSelectionPayload {
  paragraphIndex: number;
  selection: HighlightedText;
  selectionText: string;
  anchorPosition: {
    top: number;
    left: number;
  };
}

export interface ReaderParagraphHoverPayload {
  paragraphIndex: number;
  startIndex: number;
  endIndex: number;
}

interface ReaderParagraphProps {
  paragraphIndex: number;
  paragraphStartCharOffset: number;
  words: string[];
  imagesByHref?: Record<string, string>;
  imageAspectRatioByHref?: Record<string, number>;
  maxImageHeight?: number;
  fontSize: number;
  lineHeight: number;
  justifyText: boolean;
  playText: (word: string) => void;
  onSelection: (payload: ReaderParagraphSelectionPayload) => void;
  highlights: HighlightedText[];
  onWordHover?: (word: string, e: MouseEvent<HTMLElement>) => void | Promise<void>;
  onWordHoverInfo?: (payload: ReaderParagraphHoverPayload) => void;
  onWordMouseMove?: (e: MouseEvent<HTMLElement>) => void;
  onHoverClear?: () => void;
  getInternalChapterTargetPage?: (href: string) => number | null;
  onInternalChapterLinkSelect?: (targetPage: number) => void;
  resizeAnchorWordStartCharOffset?: number | null;
  isResizeAnchorHighlightVisible?: boolean;
}

const ReaderParagraphBase = ({
  paragraphIndex,
  paragraphStartCharOffset,
  words,
  imagesByHref,
  imageAspectRatioByHref,
  maxImageHeight,
  fontSize,
  lineHeight,
  justifyText,
  playText,
  onSelection,
  highlights,
  onWordHover,
  onWordHoverInfo,
  onWordMouseMove,
  onHoverClear,
  getInternalChapterTargetPage,
  onInternalChapterLinkSelect,
  resizeAnchorWordStartCharOffset,
  isResizeAnchorHighlightVisible,
}: ReaderParagraphProps) => {
  const paragraphText = words.join(' ');
  const hasMarkdownLinkOrImage = /(!\[[^\]]*\]\([^\)]*\)|\[[^\]]+\]\([^\)]*\))/u.test(
    paragraphText,
  );
  const hasMarkdownEmphasis =
    /(^|[^\p{L}\p{N}_*])((\*\*[^*\n](?:[^*\n]*[^*\n])?\*\*)|(\*[^*\n]+\*)|(__[^_\n](?:[^_\n]*[^_\n])?__)|(_[^_\n]+_))(?=$|[^\p{L}\p{N}_*])/u.test(
      paragraphText,
    );
  const hasInlineMarkdownFormatting = hasMarkdownLinkOrImage || hasMarkdownEmphasis;
  const hasBlockMarkdownFormatting =
    /^#{1,6}\s+\S/u.test(paragraphText) ||
    /^>\s+\S/u.test(paragraphText) ||
    /^[-*+]\s+\S/u.test(paragraphText) ||
    /^\d+\.\s+\S/u.test(paragraphText);
  const shouldRenderMarkdown = hasInlineMarkdownFormatting || hasBlockMarkdownFormatting;

  // Absolute character start offset of each word within words.join(' ').
  const wordCharOffsets = useMemo(() => getWordCharOffsets(words), [words]);
  const paragraphRef = useRef<HTMLDivElement | null>(null);

  const getCoreWordSelectionMeta = (rawWord: string) => {
    let startOffset = 0;
    let endOffsetExclusive = rawWord.length;

    while (startOffset < endOffsetExclusive && !/[\p{L}\p{N}]/u.test(rawWord[startOffset])) {
      startOffset += 1;
    }

    while (
      endOffsetExclusive > startOffset &&
      !/[\p{L}\p{N}]/u.test(rawWord[endOffsetExclusive - 1])
    ) {
      endOffsetExclusive -= 1;
    }

    if (startOffset === endOffsetExclusive) {
      return {
        normalizedWord: rawWord,
        startOffset: 0,
        endOffsetExclusive: rawWord.length,
      };
    }

    return {
      normalizedWord: rawWord.slice(startOffset, endOffsetExclusive),
      startOffset,
      endOffsetExclusive,
    };
  };

  const getClickedElementCoreCharRange = (element: HTMLElement, rawWord: string) => {
    const charSpans = Array.from(element.querySelectorAll<HTMLElement>('[data-char-offset]'));
    if (!charSpans.length) {
      return null;
    }

    const renderedText = charSpans.map((entry) => entry.textContent ?? '').join('');
    const { normalizedWord } = getCoreWordSelectionMeta(rawWord);
    const startInRendered = renderedText.toLowerCase().indexOf(normalizedWord.toLowerCase());

    if (startInRendered < 0) {
      return null;
    }

    const endInRenderedExclusive = startInRendered + normalizedWord.length;
    const startElement = charSpans[startInRendered];
    const endElement = charSpans[endInRenderedExclusive - 1];
    if (!startElement || !endElement) {
      return null;
    }

    const startOffset = Number(startElement.getAttribute('data-char-offset'));
    const endOffset = Number(endElement.getAttribute('data-char-offset')) + 1;
    if (Number.isNaN(startOffset) || Number.isNaN(endOffset)) {
      return null;
    }

    return {
      normalizedWord,
      startOffset,
      endOffset,
    };
  };

  const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    const sel = window.getSelection();
    const selectedText = normalizeSelectedText(sel?.toString());

    if (selectedText) {
      const range = sel?.rangeCount ? sel.getRangeAt(0) : null;
      const rect = range?.getBoundingClientRect();

      if (range) {
        const directRangeOffsets = paragraphRef.current
          ? getRangeCharOffsets(range, paragraphRef.current)
          : null;
        const resolvedOffsets = directRangeOffsets
          ? directRangeOffsets
          : (() => {
              const startFromDom = getAbsoluteCharOffset(
                range.startContainer,
                range.startOffset,
                wordCharOffsets,
              );
              // endOffset is exclusive in the Selection API.
              const endFromDom = getAbsoluteCharOffset(
                range.endContainer,
                range.endOffset,
                wordCharOffsets,
              );

              if (startFromDom != null && endFromDom != null) {
                const startInclusive = Math.min(startFromDom, endFromDom);
                const endExclusive = Math.max(startFromDom, endFromDom);
                if (endExclusive > startInclusive) {
                  return { startInclusive, endExclusive };
                }
              }

              return reconcileSelectionOffsets({
                paragraphText,
                selectedText,
                rawStart: startFromDom,
                rawEnd: endFromDom,
              });
            })();

        if (resolvedOffsets) {
          const selection = createSelectionFromRange({
            paragraphIndex,
            rawStart: resolvedOffsets.startInclusive,
            rawEnd: resolvedOffsets.endExclusive,
          });
          if (rect) {
            const startForRestore = resolvedOffsets.startInclusive;
            const endForRestore = resolvedOffsets.endExclusive;

            onSelection({
              paragraphIndex,
              selection: {
                ...selection,
                startIndex: selection.startIndex + paragraphStartCharOffset,
                endIndex: selection.endIndex + paragraphStartCharOffset,
              },
              selectionText: selectedText,
              anchorPosition: getPopoverPositionFromRect(rect),
            });

            const restoreSelection = () => {
              applyNativeSelectionByOffsets({
                paragraphElement: paragraphRef.current,
                startInclusive: startForRestore,
                endExclusive: endForRestore,
              });

              const restoredByOffsets = normalizeSelectedText(window.getSelection()?.toString());
              if (restoredByOffsets !== selectedText) {
                const restoredByText = applyNativeSelectionByText({
                  paragraphElement: paragraphRef.current,
                  selectedValue: selectedText,
                  startHint: startForRestore,
                });
                if (!restoredByText) {
                  return;
                }
              }

              const restoredFinal = normalizeSelectedText(window.getSelection()?.toString());
              if (restoredFinal !== selectedText) {
                applyNativeSelectionByOffsets({
                  paragraphElement: paragraphRef.current,
                  startInclusive: startForRestore,
                  endExclusive: endForRestore,
                });
              }
            };

            requestAnimationFrame(() => {
              restoreSelection();
              setTimeout(restoreSelection, 60);
              setTimeout(restoreSelection, 180);
            });
          }
        }
      }

      playText(selectedText);
    }
  };

  const handleWordClick = (e: MouseEvent<HTMLSpanElement>, word: string, wordIndex: number) => {
    const currentSelection = window.getSelection();
    const hasExpandedSelection = Boolean(
      currentSelection?.rangeCount && !currentSelection.getRangeAt(0).collapsed,
    );
    if (hasExpandedSelection) {
      return;
    }

    const element = e.currentTarget as HTMLElement;
    const clickedCharRange = getClickedElementCoreCharRange(element, word);
    const coreSelectionMeta = getCoreWordSelectionMeta(word);
    const clickedWordText = clickedCharRange?.normalizedWord ?? coreSelectionMeta.normalizedWord;

    playText(clickedWordText);

    // Show highlight popover by creating a selection for this word
    e.preventDefault();
    e.stopPropagation();

    const fallbackWordMeta = getSafeWordMeta({
      wordIndex,
      fallbackWord: word,
      words,
      wordCharOffsets,
    });
    const fallbackWordStart = fallbackWordMeta.sourceStart + coreSelectionMeta.startOffset;
    const fallbackWordEnd = fallbackWordMeta.sourceStart + coreSelectionMeta.endOffsetExclusive;
    const wordStart = clickedCharRange?.startOffset ?? fallbackWordStart;
    const wordEnd = clickedCharRange?.endOffset ?? fallbackWordEnd;

    const selection = createSelectionFromRange({
      paragraphIndex,
      rawStart: wordStart,
      rawEnd: wordEnd,
    });

    // Keep a visible native selection by selecting concrete char offsets.
    const wasAppliedByOffsets = applyNativeSelectionByOffsets({
      paragraphElement: paragraphRef.current,
      startInclusive: wordStart,
      endExclusive: wordEnd,
    });
    if (!wasAppliedByOffsets) {
      applyNativeSelectionForWordElement(e.currentTarget);
    }

    // Get the element's bounding rect for popover positioning
    const rect = element.getBoundingClientRect();
    onSelection({
      paragraphIndex,
      selection: {
        ...selection,
        startIndex: selection.startIndex + paragraphStartCharOffset,
        endIndex: selection.endIndex + paragraphStartCharOffset,
      },
      selectionText: clickedWordText,
      anchorPosition: getPopoverPositionFromRect(rect),
    });

    requestAnimationFrame(() => {
      const restored = applyNativeSelectionByOffsets({
        paragraphElement: paragraphRef.current,
        startInclusive: wordStart,
        endExclusive: wordEnd,
      });

      if (!restored) {
        const paragraphElement = paragraphRef.current;
        if (!paragraphElement) return;
        const currentWordElement = paragraphElement.querySelector<HTMLElement>(
          `[data-word-index="${wordIndex}"]`,
        );
        applyNativeSelectionForWordElement(currentWordElement);
      }
    });
  };

  return (
    <>
      <Typography
        variant="body1"
        component="div"
        ref={paragraphRef}
        onMouseUp={handleMouseUp}
        onMouseLeave={onHoverClear}
        sx={{
          fontFamily: 'serif',
          fontSize: `${fontSize}px`,
          lineHeight,
          textAlign: justifyText ? 'justify' : 'left',
          '*': {
            fontFamily: 'serif',
          },
        }}
      >
        <ReaderMarkdown
          words={shouldRenderMarkdown ? undefined : words}
          imageDataUrlByHref={imagesByHref}
          imageAspectRatioByHref={imageAspectRatioByHref}
          maxImageHeight={maxImageHeight}
          getInternalChapterTargetPage={getInternalChapterTargetPage}
          onInternalChapterLinkSelect={onInternalChapterLinkSelect}
          renderWord={({ word, wordIndex }) => {
            const { sourceWord, sourceStart } = getSafeWordMeta({
              wordIndex,
              fallbackWord: word,
              words,
              wordCharOffsets,
            });
            // In markdown mode, source tokens can contain decorators (e.g. **word**).
            // Map rendered word chars to the visible substring inside the source token.
            const renderedWordStartInSource = sourceWord.toLowerCase().indexOf(word.toLowerCase());
            const wordStart =
              renderedWordStartInSource >= 0
                ? sourceStart + renderedWordStartInSource
                : sourceStart;
            const sourceWordStartCharOffset = paragraphStartCharOffset + sourceStart;
            const isResizeAnchorWord =
              isResizeAnchorHighlightVisible &&
              resizeAnchorWordStartCharOffset != null &&
              sourceWordStartCharOffset === resizeAnchorWordStartCharOffset;

            return (
              <Stack
                component="span"
                className="conversation-word"
                data-word-index={wordIndex}
                data-reader-word-anchor="true"
                data-reader-anchor-key={`${paragraphIndex}-${sourceWordStartCharOffset}`}
                data-reader-anchor-paragraph-index={paragraphIndex}
                data-reader-anchor-word-start-char-offset={sourceWordStartCharOffset}
                data-resize-anchor-highlighted={isResizeAnchorWord ? 'true' : undefined}
                sx={{
                  fontSize: `${fontSize}px`,
                  lineHeight,
                  display: 'inline',
                  cursor: 'pointer',
                  borderBottom: '1px dotted transparent',
                  position: 'relative',
                  backgroundColor: isResizeAnchorWord ? 'rgba(255, 153, 0, 0.35)' : 'transparent',
                  borderRadius: isResizeAnchorWord ? '4px' : 0,
                  transition: 'background-color 200ms ease-out',
                  ':hover': {
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      width: 'calc(100% + 13px)',
                      height: 'calc(100% + 0px)',
                      top: '1px',
                      left: '-6px',
                      borderRadius: '8px',
                      backgroundColor: '#d3d3d3ab',
                      zIndex: -1,
                      '@media (max-width: 500px)': {
                        display: 'none',
                      },
                    },
                  },
                }}
                onClick={(e) => {
                  const element = e.currentTarget as HTMLElement;
                  if (element.closest('a')) {
                    return;
                  }
                  handleWordClick(e, word, wordIndex);
                }}
                onMouseEnter={(e) => {
                  void onWordHover?.(word, e);
                  const coreSelectionMeta = getCoreWordSelectionMeta(word);
                  onWordHoverInfo?.({
                    paragraphIndex,
                    startIndex:
                      wordStart + coreSelectionMeta.startOffset + paragraphStartCharOffset,
                    endIndex:
                      wordStart + coreSelectionMeta.endOffsetExclusive + paragraphStartCharOffset,
                  });
                }}
                onMouseMove={(e) => onWordMouseMove?.(e)}
              >
                {word.split('').map((char, charIdx) => {
                  const absOffset = wordStart + charIdx;
                  const sourceOffset = absOffset + paragraphStartCharOffset;
                  const color = getCharColorAtOffset(sourceOffset, highlights);
                  const prevColor =
                    charIdx > 0 ? getCharColorAtOffset(sourceOffset - 1, highlights) : null;
                  const nextColor =
                    charIdx < word.length - 1
                      ? getCharColorAtOffset(sourceOffset + 1, highlights)
                      : null;
                  const isStart = color !== null && color !== prevColor;
                  const isEnd = color !== null && color !== nextColor;

                  return (
                    <span
                      key={charIdx}
                      data-char-offset={absOffset}
                      style={{
                        backgroundColor: color ?? 'transparent',
                        cursor: 'pointer',
                        borderRadius:
                          isStart && isEnd
                            ? '3px'
                            : isStart
                              ? '3px 0 0 3px'
                              : isEnd
                                ? '0 3px 3px 0'
                                : '0',
                      }}
                    >
                      {char}
                    </span>
                  );
                })}
              </Stack>
            );
          }}
          renderSpace={
            shouldRenderMarkdown
              ? undefined
              : (wordIndex) => {
                  const { sourceWord, sourceStart } = getSafeWordMeta({
                    wordIndex,
                    fallbackWord: '',
                    words,
                    wordCharOffsets,
                  });
                  const wordStart = sourceStart;
                  const wordLength = sourceWord.length;

                  return (
                    <span
                      data-char-offset={wordStart + wordLength}
                      style={{
                        backgroundColor:
                          getCharColorAtOffset(
                            wordStart + wordLength + paragraphStartCharOffset,
                            highlights,
                          ) ?? 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      {' '}
                    </span>
                  );
                }
          }
        >
          {paragraphText}
        </ReaderMarkdown>
      </Typography>
    </>
  );
};

export const ReaderParagraph = memo(ReaderParagraphBase);
ReaderParagraph.displayName = 'ReaderParagraph';
