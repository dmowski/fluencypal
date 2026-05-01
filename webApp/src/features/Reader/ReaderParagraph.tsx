import { Stack, Typography } from '@mui/material';
import { MouseEvent, useState } from 'react';
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

  const handleClosePopover = () => {
    setPopoverPosition(null);
    setSelection(null);
  };

  const getWordIndexFromNode = (node: Node | null): number | null => {
    if (!node) return null;

    const element =
      node instanceof Element ? node : (node.parentElement ?? (node.parentNode as Element | null));

    if (!element) return null;

    const wordElement = element.closest('[data-word-index]');
    if (!wordElement) return null;

    const value = Number(wordElement.getAttribute('data-word-index'));
    return Number.isNaN(value) ? null : value;
  };

  const handleMouseUp = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() ?? '';

    if (selectedText) {
      const range = selection?.rangeCount ? selection.getRangeAt(0) : null;
      const rect = range?.getBoundingClientRect();

      if (rect) {
        setPopoverPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX + rect.width / 2,
        });
      }

      if (range) {
        const startIndex = getWordIndexFromNode(range.startContainer);
        const endIndex = getWordIndexFromNode(range.endContainer);

        if (startIndex !== null && endIndex !== null) {
          setSelection({
            paragraphIndex,
            startIndex: Math.min(startIndex, endIndex),
            endIndex: Math.max(startIndex, endIndex),
            color: '',
          });
        }
      }

      onTextSelected(selectedText);
      return;
    }
  };

  const handleWordClick = (e: MouseEvent<HTMLSpanElement>, word: string) => {
    const wordIndex = Number(e.currentTarget.getAttribute('data-word-index'));
    const rect = e.currentTarget.getBoundingClientRect();

    setPopoverPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX + rect.width / 2,
    });

    if (!Number.isNaN(wordIndex)) {
      setSelection({
        paragraphIndex,
        startIndex: wordIndex,
        endIndex: wordIndex,
        color: '',
      });
    }

    onWordClick(word);
    onTextSelected(word);
  };

  const getHighlightAtWordIndex = (wordIndex: number): HighlightedText | null => {
    for (let i = highlights.length - 1; i >= 0; i -= 1) {
      const highlight = highlights[i];
      if (wordIndex >= highlight.startIndex && wordIndex <= highlight.endIndex) {
        return highlight;
      }
    }

    return null;
  };

  const getWordHighlightColor = (wordIndex: number) =>
    getHighlightAtWordIndex(wordIndex)?.color ?? null;

  return (
    <Typography
      variant="body1"
      onMouseUp={handleMouseUp}
      sx={{
        fontFamily: 'serif',
        fontSize: '36px',
        lineHeight: '1.5',
        textAlign: 'justify',
      }}
    >
      {words.map((word, index) => (
        <span key={index}>
          <Stack
            component="span"
            data-word-index={index}
            sx={{
              fontFamily: 'serif',
              fontSize: '36px',
              lineHeight: '1.5',
              display: 'inline',
              borderBottom: '1px dotted transparent',
              position: 'relative',
              borderRadius: '3px',
              backgroundColor: getWordHighlightColor(index) ?? 'transparent',
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
            onClick={(e) => handleWordClick(e, word)}
          >
            {word}
          </Stack>{' '}
        </span>
      ))}

      <TextPopover
        anchorPosition={popoverPosition}
        onClose={handleClosePopover}
        activeColor={selection ? getHighlightAtWordIndex(selection.startIndex)?.color : undefined}
        onColorSelect={(color) => {
          if (!selection) return;
          const existing = getHighlightAtWordIndex(selection.startIndex);
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
