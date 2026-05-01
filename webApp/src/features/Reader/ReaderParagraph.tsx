import { Stack, Typography } from '@mui/material';
import { MouseEvent, useMemo, useRef, useState } from 'react';
import { getTranslation, normalizeToNativeLangCode } from '../Translation/translationHelpers';
import { FLYING_TOOLTIP_OFFSET_X, FLYING_TOOLTIP_OFFSET_Y, FlyingTooltip } from './FlyingTooltip';
import {
  getAbsoluteCharOffset,
  getCharHighlightColor,
  getHighlightAtCharRange,
  getWordCharOffsets,
} from './readerParagraphHelpers';
import { TextPopover } from './TextPopover';
import { HighlightedText } from './types';
import { NativeLangCode } from '@/libs/language/type';

export const ReaderParagraph = ({
  paragraphIndex,
  words,
  sourceLanguage,
  targetLanguage,
  onWordClick,
  onTextSelected,
  highlights,
  onHighlightColorSelect,
  onRemoveHighlight,
}: {
  paragraphIndex: number;
  words: string[];
  sourceLanguage: string;
  targetLanguage: NativeLangCode | null;
  onWordClick: (word: string) => void;
  onTextSelected: (selectedText: string) => void;
  highlights: HighlightedText[];
  onHighlightColorSelect: (highlight: HighlightedText) => void;
  onRemoveHighlight: (highlight: HighlightedText) => void;
}) => {
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const [selection, setSelection] = useState<HighlightedText | null>(null);
  const [hoverTranslation, setHoverTranslation] = useState<string | null>(null);
  const [hoverPointer, setHoverPointer] = useState<{ x: number; y: number } | null>(null);
  const hoverRequestIdRef = useRef(0);

  // Absolute character start offset of each word within words.join(' ').
  const wordCharOffsets = useMemo(() => getWordCharOffsets(words), [words]);
  const normalizedSourceLanguage = useMemo(
    () => normalizeToNativeLangCode(sourceLanguage),
    [sourceLanguage],
  );

  const handleClosePopover = () => {
    setPopoverPosition(null);
    setSelection(null);
  };

  const clearHoverTranslation = () => {
    hoverRequestIdRef.current += 1;
    setHoverTranslation(null);
    setHoverPointer(null);
  };

  const handleWordMouseEnter = async (e: MouseEvent<HTMLSpanElement>, word: string) => {
    setHoverPointer({
      x: e.clientX + FLYING_TOOLTIP_OFFSET_X,
      y: e.clientY + FLYING_TOOLTIP_OFFSET_Y,
    });

    const text = word.trim();
    if (!text || !targetLanguage || normalizedSourceLanguage === targetLanguage) {
      clearHoverTranslation();
      return;
    }

    const requestId = hoverRequestIdRef.current + 1;
    hoverRequestIdRef.current = requestId;
    setHoverTranslation(null);

    try {
      const translated = await getTranslation({
        text,
        sourceLanguage: normalizedSourceLanguage,
        targetLanguage,
      });

      if (hoverRequestIdRef.current !== requestId || !translated.trim()) {
        return;
      }

      setHoverTranslation(translated);
    } catch {
      if (hoverRequestIdRef.current === requestId) {
        setHoverTranslation(null);
      }
    }
  };

  const handleWordMouseMove = (e: MouseEvent<HTMLSpanElement>) => {
    setHoverPointer({
      x: e.clientX + FLYING_TOOLTIP_OFFSET_X,
      y: e.clientY + FLYING_TOOLTIP_OFFSET_Y,
    });
  };

  const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const sel = window.getSelection();
    const selectedText = sel?.toString().trim() ?? '';

    if (selectedText) {
      const range = sel?.rangeCount ? sel.getRangeAt(0) : null;
      const rect = range?.getBoundingClientRect();

      if (rect) {
        setPopoverPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX + rect.width / 2,
        });
      }

      if (range) {
        const rawStart = getAbsoluteCharOffset(
          range.startContainer,
          range.startOffset,
          wordCharOffsets,
        );
        // endOffset is exclusive in the Selection API — subtract 1 to store inclusive end.
        const rawEnd = getAbsoluteCharOffset(range.endContainer, range.endOffset, wordCharOffsets);

        if (rawStart !== null && rawEnd !== null) {
          setSelection({
            paragraphIndex,
            startIndex: Math.min(rawStart, rawEnd - 1),
            endIndex: Math.max(rawStart, rawEnd - 1),
            color: '',
          });
        }
      }

      onTextSelected(selectedText);
    }
  };

  const handleWordClick = (e: MouseEvent<HTMLSpanElement>, word: string, wordIndex: number) => {
    const rect = e.currentTarget.getBoundingClientRect();

    setPopoverPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX + rect.width / 2,
    });

    const charStart = wordCharOffsets[wordIndex];
    setSelection({
      paragraphIndex,
      startIndex: charStart,
      endIndex: charStart + word.length - 1,
      color: '',
    });

    onWordClick(word);
    onTextSelected(word);
  };

  return (
    <>
      <Typography
        variant="body1"
        onMouseUp={handleMouseUp}
        onMouseLeave={clearHoverTranslation}
        sx={{
          fontFamily: 'serif',
          fontSize: '36px',
          lineHeight: '1.5',
          textAlign: 'justify',
          '*': {
            fontFamily: 'serif',
          },
        }}
      >
        {words.map((word, wordIndex) => {
          const wordStart = wordCharOffsets[wordIndex];
          return (
            <span key={wordIndex}>
              <Stack
                component="span"
                data-word-index={wordIndex}
                sx={{
                  fontSize: '36px',
                  lineHeight: '1.5',
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
                    },
                  },
                }}
                onClick={(e) => handleWordClick(e, word, wordIndex)}
                onMouseEnter={(e) => void handleWordMouseEnter(e, word)}
                onMouseMove={handleWordMouseMove}
              >
                {word.split('').map((char, charIdx) => {
                  const absOffset = wordStart + charIdx;
                  const color = getCharHighlightColor(absOffset, highlights);
                  const prevColor =
                    charIdx > 0 ? getCharHighlightColor(absOffset - 1, highlights) : null;
                  const nextColor =
                    charIdx < word.length - 1
                      ? getCharHighlightColor(absOffset + 1, highlights)
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
                      getCharHighlightColor(wordStart + word.length, highlights) ?? 'transparent',
                  }}
                >
                  {' '}
                </span>
              )}
            </span>
          );
        })}

        <TextPopover
          anchorPosition={popoverPosition}
          onClose={handleClosePopover}
          activeColor={
            selection
              ? getHighlightAtCharRange(selection.startIndex, selection.endIndex, highlights)?.color
              : undefined
          }
          onColorSelect={(color) => {
            if (!selection) return;
            const existing = getHighlightAtCharRange(
              selection.startIndex,
              selection.endIndex,
              highlights,
            );
            if (existing?.color === color) {
              onRemoveHighlight(existing);
            } else {
              onHighlightColorSelect({ ...selection, color });
            }
            setSelection(null);
            setPopoverPosition(null);
          }}
        />
      </Typography>
      {hoverTranslation ? (
        <FlyingTooltip text={hoverTranslation} initialPosition={hoverPointer} />
      ) : null}
    </>
  );
};
