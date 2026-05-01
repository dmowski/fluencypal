import { Stack, Typography } from '@mui/material';
import { MouseEvent, useMemo, useState } from 'react';
import { TextPopover } from './TextPopover';
import { HighlightedText } from './types';

export const ReaderParagraph = ({
  paragraphIndex,
  words,
  onWordClick,
  onTextSelected,
  highlights,
  onHighlightColorSelect,
  onRemoveHighlight,
}: {
  paragraphIndex: number;
  words: string[];
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

  // Absolute character start offset of each word within words.join(' ').
  const wordCharOffsets = useMemo(() => {
    const offsets: number[] = [];
    let pos = 0;
    for (const word of words) {
      offsets.push(pos);
      pos += word.length + 1; // +1 for the trailing space
    }
    return offsets;
  }, [words]);

  const handleClosePopover = () => {
    setPopoverPosition(null);
    setSelection(null);
  };

  // Resolves an absolute paragraph char offset from a Selection range endpoint.
  // Each character is rendered in its own span tagged with data-char-offset so
  // range.startOffset / endOffset (position within that single-char text node)
  // can be added directly to the span's base offset.
  const getAbsoluteCharOffset = (node: Node | null, offsetWithinNode: number): number | null => {
    if (!node) return null;
    const element = node instanceof Element ? node : node.parentElement;
    if (!element) return null;

    const charEl = element.closest('[data-char-offset]');
    if (charEl) {
      const base = Number(charEl.getAttribute('data-char-offset'));
      return Number.isNaN(base) ? null : base + offsetWithinNode;
    }

    // Fallback: word-level (e.g. selection starts at the word span itself)
    const wordEl = element.closest('[data-word-index]');
    if (!wordEl) return null;
    const wordIndex = Number(wordEl.getAttribute('data-word-index'));
    return Number.isNaN(wordIndex) ? null : wordCharOffsets[wordIndex] + offsetWithinNode;
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
        const rawStart = getAbsoluteCharOffset(range.startContainer, range.startOffset);
        // endOffset is exclusive in the Selection API — subtract 1 to store inclusive end.
        const rawEnd = getAbsoluteCharOffset(range.endContainer, range.endOffset);

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

  // Returns the topmost highlight overlapping [charStart, charEnd] (inclusive).
  const getHighlightAtCharRange = (charStart: number, charEnd: number): HighlightedText | null => {
    for (let i = highlights.length - 1; i >= 0; i -= 1) {
      const h = highlights[i];
      if (h.startIndex <= charEnd && h.endIndex >= charStart) return h;
    }
    return null;
  };

  const getCharHighlightColor = (absOffset: number): string | null =>
    getHighlightAtCharRange(absOffset, absOffset)?.color ?? null;

  return (
    <Typography
      variant="body1"
      onMouseUp={handleMouseUp}
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
            >
              {word.split('').map((char, charIdx) => {
                const absOffset = wordStart + charIdx;
                const color = getCharHighlightColor(absOffset);
                const prevColor = charIdx > 0 ? getCharHighlightColor(absOffset - 1) : null;
                const nextColor =
                  charIdx < word.length - 1 ? getCharHighlightColor(absOffset + 1) : null;
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
                  backgroundColor: getCharHighlightColor(wordStart + word.length) ?? 'transparent',
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
            ? getHighlightAtCharRange(selection.startIndex, selection.endIndex)?.color
            : undefined
        }
        onColorSelect={(color) => {
          if (!selection) return;
          const existing = getHighlightAtCharRange(selection.startIndex, selection.endIndex);
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
  );
};
