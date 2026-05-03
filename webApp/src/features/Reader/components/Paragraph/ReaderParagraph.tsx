import { Stack, Typography } from '@mui/material';
import { MouseEvent, useMemo } from 'react';
import {
  createSelectionFromRange,
  getPopoverPositionFromRect,
} from '../../utils/readerParagraphInteractionHelpers';
import {
  getAbsoluteCharOffset,
  getCharHighlightColor,
  getWordCharOffsets,
} from '../../utils/readerParagraphHelpers';
import { normalizeSelectedText } from '../../utils/readerParagraphTranslationHelpers';
import { HighlightedText } from '../../model/types';
import { ReaderMarkdown } from './ReaderMarkdown';
import { isUseMarkdown } from './readerRenderFlags';

export interface ReaderParagraphSelectionPayload {
  paragraphIndex: number;
  selection: HighlightedText;
  selectionText: string;
  anchorPosition: {
    top: number;
    left: number;
  };
}

export const ReaderParagraph = ({
  paragraphIndex,
  paragraphStartCharOffset,
  words,
  fontSize,
  lineHeight,
  justifyText,
  playText,
  onSelection,
  highlights,
  onWordHover,
  onWordMouseMove,
  onHoverClear,
}: {
  paragraphIndex: number;
  paragraphStartCharOffset: number;
  words: string[];
  fontSize: number;
  lineHeight: number;
  justifyText: boolean;
  playText: (word: string) => void;
  onSelection: (payload: ReaderParagraphSelectionPayload) => void;
  highlights: HighlightedText[];
  onWordHover?: (word: string, e: MouseEvent<HTMLElement>) => void | Promise<void>;
  onWordMouseMove?: (e: MouseEvent<HTMLElement>) => void;
  onHoverClear?: () => void;
}) => {
  // Absolute character start offset of each word within words.join(' ').
  const wordCharOffsets = useMemo(() => getWordCharOffsets(words), [words]);

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
    e.preventDefault();
    e.stopPropagation();
    const sel = window.getSelection();
    const selectedText = normalizeSelectedText(sel?.toString());

    if (selectedText) {
      const range = sel?.rangeCount ? sel.getRangeAt(0) : null;
      const rect = range?.getBoundingClientRect();

      if (range) {
        const rawStart = getAbsoluteCharOffset(
          range.startContainer,
          range.startOffset,
          wordCharOffsets,
        );
        // endOffset is exclusive in the Selection API — subtract 1 to store inclusive end.
        const rawEnd = getAbsoluteCharOffset(range.endContainer, range.endOffset, wordCharOffsets);

        if (rawStart !== null && rawEnd !== null) {
          const selection = createSelectionFromRange({ paragraphIndex, rawStart, rawEnd });
          if (rect) {
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
    // emulate select
    window.getSelection()?.setBaseAndExtent(e.currentTarget, 0, e.currentTarget, word.length);

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
  };

  return (
    <>
      <Typography
        variant="body1"
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
                    borderBottom: '1px dotted transparent',
                    position: 'relative',
                    ':hover': {
                      cursor: 'pointer',
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
                    borderBottom: '1px dotted transparent',
                    position: 'relative',
                    ':hover': {
                      cursor: 'pointer',
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
