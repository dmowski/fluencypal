import { Stack, Typography } from '@mui/material';
import { memo, MouseEvent, useMemo, useRef } from 'react';
import {
  createSelectionFromRange,
  getPopoverPositionFromRect,
} from '../../utils/readerParagraphInteractionHelpers';
import {
  getAbsoluteCharOffset,
  getCharHighlightColor,
  getRangeCharOffsets,
  getWordCharOffsets,
} from '../../utils/readerParagraphHelpers';
import { normalizeSelectedText } from '../../utils/readerParagraphTranslationHelpers';
import { HighlightedText } from '../../model/types';
import { ReaderMarkdown } from './ReaderMarkdown';

export interface ReaderParagraphSelectionPayload {
  paragraphIndex: number;
  selection: HighlightedText;
  selectionText: string;
  anchorPosition: {
    top: number;
    left: number;
  };
}

interface ReaderParagraphProps {
  paragraphIndex: number;
  paragraphStartCharOffset: number;
  words: string[];
  isUseMarkdown: boolean;
  fontSize: number;
  lineHeight: number;
  justifyText: boolean;
  playText: (word: string) => void;
  onSelection: (payload: ReaderParagraphSelectionPayload) => void;
  highlights: HighlightedText[];
  onWordHover?: (word: string, e: MouseEvent<HTMLElement>) => void | Promise<void>;
  onWordMouseMove?: (e: MouseEvent<HTMLElement>) => void;
  onHoverClear?: () => void;
}

const ReaderParagraphBase = ({
  paragraphIndex,
  paragraphStartCharOffset,
  words,
  isUseMarkdown,
  fontSize,
  lineHeight,
  justifyText,
  playText,
  onSelection,
  highlights,
  onWordHover,
  onWordMouseMove,
  onHoverClear,
}: ReaderParagraphProps) => {
  // Absolute character start offset of each word within words.join(' ').
  const wordCharOffsets = useMemo(() => getWordCharOffsets(words), [words]);
  const paragraphRef = useRef<HTMLDivElement | null>(null);

  const findFirstTextNode = (node: Node): Text | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node as Text;
    }

    for (const child of Array.from(node.childNodes)) {
      const found = findFirstTextNode(child);
      if (found) return found;
    }

    return null;
  };

  const findLastTextNode = (node: Node): Text | null => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node as Text;
    }

    const children = Array.from(node.childNodes);
    for (let i = children.length - 1; i >= 0; i -= 1) {
      const found = findLastTextNode(children[i]);
      if (found) return found;
    }

    return null;
  };

  const applyNativeSelectionForWordElement = (element: HTMLElement | null) => {
    if (!element) return;

    const textStart = findFirstTextNode(element);
    const textEnd = findLastTextNode(element);
    if (!textStart || !textEnd) return;

    const range = document.createRange();
    range.setStart(textStart, 0);
    range.setEnd(textEnd, textEnd.textContent?.length ?? 0);
    const domSelection = window.getSelection();
    domSelection?.removeAllRanges();
    domSelection?.addRange(range);
  };

  const applyNativeSelectionByOffsets = (startInclusive: number, endExclusive: number) => {
    const paragraphElement = paragraphRef.current;
    if (!paragraphElement) return;

    const startElement = paragraphElement.querySelector<HTMLElement>(
      `[data-char-offset="${startInclusive}"]`,
    );
    const endElement = paragraphElement.querySelector<HTMLElement>(
      `[data-char-offset="${Math.max(endExclusive - 1, startInclusive)}"]`,
    );
    if (!startElement || !endElement) return;

    const textStart = findFirstTextNode(startElement);
    const textEnd = findLastTextNode(endElement);
    if (!textStart || !textEnd) return;

    const range = document.createRange();
    range.setStart(textStart, 0);
    range.setEnd(textEnd, textEnd.textContent?.length ?? 0);

    const domSelection = window.getSelection();
    domSelection?.removeAllRanges();
    domSelection?.addRange(range);
  };

  const applyNativeSelectionByText = (selectedValue: string, startHint?: number) => {
    if (!selectedValue) {
      return false;
    }

    const paragraphElement = paragraphRef.current;
    if (!paragraphElement) {
      return false;
    }

    const fullText = paragraphElement.textContent ?? '';
    if (!fullText.length) {
      return false;
    }

    const occurrences: number[] = [];
    let searchFrom = 0;
    while (searchFrom <= fullText.length) {
      const index = fullText.indexOf(selectedValue, searchFrom);
      if (index < 0) break;
      occurrences.push(index);
      searchFrom = index + 1;
    }

    if (occurrences.length === 0) {
      return false;
    }

    const targetStart =
      typeof startHint === 'number'
        ? occurrences.reduce((best, current) =>
            Math.abs(current - startHint) < Math.abs(best - startHint) ? current : best,
          )
        : occurrences[0];
    const targetEndExclusive = targetStart + selectedValue.length;

    const walker = document.createTreeWalker(paragraphElement, NodeFilter.SHOW_TEXT);
    const segments: Array<{ node: Text; start: number; end: number }> = [];
    let cursor = 0;

    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      const content = node.textContent ?? '';
      if (!content.length) {
        continue;
      }

      const start = cursor;
      const end = cursor + content.length;
      segments.push({ node, start, end });
      cursor = end;
    }

    const startSegment = segments.find(
      (segment) => segment.start <= targetStart && targetStart < segment.end,
    );
    const endSegment = segments.find(
      (segment) => segment.start < targetEndExclusive && targetEndExclusive <= segment.end,
    );

    if (!startSegment || !endSegment) {
      return false;
    }

    const range = document.createRange();
    range.setStart(startSegment.node, targetStart - startSegment.start);
    range.setEnd(endSegment.node, targetEndExclusive - endSegment.start);

    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);

    return true;
  };

  const getSafeWordMeta = (wordIndex: number, fallbackWord: string) => {
    const lastSafeIndex = Math.max(words.length - 1, 0);
    const safeIndex = Math.min(Math.max(wordIndex, 0), lastSafeIndex);
    const sourceWord = words[safeIndex] ?? fallbackWord;
    const sourceStart = wordCharOffsets[safeIndex] ?? 0;

    return {
      sourceWord,
      sourceStart,
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
        const paragraphText = words.join(' ');
        const directRangeOffsets = paragraphRef.current
          ? getRangeCharOffsets(range, paragraphRef.current)
          : null;
        const rawStart =
          directRangeOffsets?.startInclusive ??
          getAbsoluteCharOffset(range.startContainer, range.startOffset, wordCharOffsets);
        // endOffset is exclusive in the Selection API.
        const rawEnd =
          directRangeOffsets?.endExclusive ??
          getAbsoluteCharOffset(range.endContainer, range.endOffset, wordCharOffsets);

        let resolvedRawStart = rawStart;
        let resolvedRawEnd = rawEnd;

        const reconcileOffsetsWithSelectedText = () => {
          if (resolvedRawStart === null || resolvedRawEnd === null) {
            return;
          }

          const boundedStart = Math.max(0, Math.min(resolvedRawStart, paragraphText.length));
          const boundedEnd = Math.max(
            boundedStart + 1,
            Math.min(resolvedRawEnd, paragraphText.length),
          );

          resolvedRawStart = boundedStart;
          resolvedRawEnd = boundedEnd;

          const selectedLength = selectedText.length;
          if (selectedLength === 0) {
            return;
          }

          const extracted = paragraphText.slice(resolvedRawStart, resolvedRawEnd);
          if (extracted === selectedText) {
            return;
          }

          if (resolvedRawEnd < resolvedRawStart + selectedLength) {
            resolvedRawEnd = Math.min(resolvedRawStart + selectedLength, paragraphText.length);
          }

          const adjustedExtracted = paragraphText.slice(resolvedRawStart, resolvedRawEnd);
          if (adjustedExtracted === selectedText) {
            return;
          }

          const nearbyStart = Math.max(0, resolvedRawStart - selectedLength);
          const locatedAt = paragraphText.indexOf(selectedText, nearbyStart);
          if (locatedAt >= 0) {
            resolvedRawStart = locatedAt;
            resolvedRawEnd = Math.min(locatedAt + selectedLength, paragraphText.length);
          }
        };

        if (resolvedRawStart === null || resolvedRawEnd === null) {
          const fallbackStart = paragraphText.indexOf(selectedText);
          if (fallbackStart >= 0) {
            resolvedRawStart = fallbackStart;
            resolvedRawEnd = fallbackStart + selectedText.length;
          }
        }

        reconcileOffsetsWithSelectedText();

        if (resolvedRawStart !== null && resolvedRawEnd !== null) {
          const selection = createSelectionFromRange({
            paragraphIndex,
            rawStart: resolvedRawStart,
            rawEnd: resolvedRawEnd,
          });
          if (rect) {
            const startForRestore = resolvedRawStart;
            const endForRestore = resolvedRawEnd;

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

            requestAnimationFrame(() => {
              const restoredByText = applyNativeSelectionByText(selectedText, startForRestore);
              if (!restoredByText) {
                applyNativeSelectionByOffsets(startForRestore, endForRestore);
              }
            });
          }
        }
      }

      playText(selectedText);
    }
  };

  const handleWordClick = (e: MouseEvent<HTMLSpanElement>, word: string, wordIndex: number) => {
    playText(word);

    // Show highlight popover by creating a selection for this word
    e.preventDefault();
    e.stopPropagation();

    const { sourceStart } = getSafeWordMeta(wordIndex, word);
    const wordStart = sourceStart;
    const wordEnd = wordStart + word.length;

    const selection = createSelectionFromRange({
      paragraphIndex,
      rawStart: wordStart,
      rawEnd: wordEnd,
    });

    // Keep a visible native selection by selecting concrete text-node boundaries.
    applyNativeSelectionForWordElement(e.currentTarget);

    // Get the element's bounding rect for popover positioning
    const element = e.currentTarget as HTMLElement;
    const rect = element.getBoundingClientRect();
    onSelection({
      paragraphIndex,
      selection: {
        ...selection,
        startIndex: selection.startIndex + paragraphStartCharOffset,
        endIndex: selection.endIndex + paragraphStartCharOffset,
      },
      selectionText: word,
      anchorPosition: getPopoverPositionFromRect(rect),
    });

    requestAnimationFrame(() => {
      const paragraphElement = paragraphRef.current;
      if (!paragraphElement) return;

      const currentWordElement = paragraphElement.querySelector<HTMLElement>(
        `[data-word-index="${wordIndex}"]`,
      );
      applyNativeSelectionForWordElement(currentWordElement);
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
        {isUseMarkdown ? (
          <ReaderMarkdown
            renderWord={({ word, wordIndex }) => {
              const { sourceStart } = getSafeWordMeta(wordIndex, word);
              const wordStart = sourceStart;

              return (
                <Stack
                  component="span"
                  className="conversation-word"
                  data-word-index={wordIndex}
                  sx={{
                    fontSize: `${fontSize}px`,
                    lineHeight,
                    display: 'inline',
                    cursor: 'pointer',
                    borderBottom: '1px dotted transparent',
                    position: 'relative',
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
                  onClick={(e) => handleWordClick(e, word, wordIndex)}
                  onMouseEnter={(e) => void onWordHover?.(word, e)}
                  onMouseMove={(e) => onWordMouseMove?.(e)}
                >
                  {word.split('').map((char, charIdx) => {
                    const absOffset = wordStart + charIdx;
                    const sourceOffset = absOffset + paragraphStartCharOffset;
                    const color = getCharHighlightColor(sourceOffset, highlights);
                    const prevColor =
                      charIdx > 0 ? getCharHighlightColor(sourceOffset - 1, highlights) : null;
                    const nextColor =
                      charIdx < word.length - 1
                        ? getCharHighlightColor(sourceOffset + 1, highlights)
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
            renderSpace={(wordIndex) => {
              const { sourceWord, sourceStart } = getSafeWordMeta(wordIndex, '');
              const wordStart = sourceStart;
              const wordLength = sourceWord.length;

              return (
                <span
                  data-char-offset={wordStart + wordLength}
                  style={{
                    backgroundColor:
                      getCharHighlightColor(
                        wordStart + wordLength + paragraphStartCharOffset,
                        highlights,
                      ) ?? 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {' '}
                </span>
              );
            }}
          >
            {words.join(' ')}
          </ReaderMarkdown>
        ) : (
          words.map((word, wordIndex) => {
            const { sourceStart } = getSafeWordMeta(wordIndex, word);
            const wordStart = sourceStart;
            return (
              <span key={wordIndex}>
                <Stack
                  component="span"
                  data-word-index={wordIndex}
                  sx={{
                    fontSize: `${fontSize}px`,
                    lineHeight,
                    display: 'inline',
                    cursor: 'pointer',
                    borderBottom: '1px dotted transparent',
                    position: 'relative',
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
                  onClick={(e) => handleWordClick(e, word, wordIndex)}
                  onMouseEnter={(e) => void onWordHover?.(word, e)}
                  onMouseMove={(e) => onWordMouseMove?.(e)}
                >
                  {word.split('').map((char, charIdx) => {
                    const absOffset = wordStart + charIdx;
                    const sourceOffset = absOffset + paragraphStartCharOffset;
                    const color = getCharHighlightColor(sourceOffset, highlights);
                    const prevColor =
                      charIdx > 0 ? getCharHighlightColor(sourceOffset - 1, highlights) : null;
                    const nextColor =
                      charIdx < word.length - 1
                        ? getCharHighlightColor(sourceOffset + 1, highlights)
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
                {wordIndex < words.length - 1 && (
                  <span
                    data-char-offset={wordStart + word.length}
                    style={{
                      backgroundColor:
                        getCharHighlightColor(
                          wordStart + word.length + paragraphStartCharOffset,
                          highlights,
                        ) ?? 'transparent',
                      cursor: 'pointer',
                    }}
                  >
                    {' '}
                  </span>
                )}
              </span>
            );
          })
        )}
      </Typography>
    </>
  );
};

export const ReaderParagraph = memo(ReaderParagraphBase);
ReaderParagraph.displayName = 'ReaderParagraph';
