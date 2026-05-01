import { Stack, Typography } from '@mui/material';
import { MouseEvent, useState } from 'react';
import { TextPopover } from './TextPopover';

export const ReaderParagraph = ({
  words,
  onWordClick,
  onTextSelected,
}: {
  words: string[];
  onWordClick: (word: string) => void;
  onTextSelected: (selectedText: string) => void;
}) => {
  const [popoverPosition, setPopoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);

  const handleClosePopover = () => {
    setPopoverPosition(null);
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

      onTextSelected(selectedText);
      return;
    }

    handleClosePopover();
  };

  const handleWordClick = (e: MouseEvent<HTMLSpanElement>, word: string) => {
    const rect = e.currentTarget.getBoundingClientRect();

    setPopoverPosition({
      top: rect.bottom + window.scrollY + 8,
      left: rect.left + window.scrollX + rect.width / 2,
    });

    onWordClick(word);
    onTextSelected(word);
  };

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
            sx={{
              fontFamily: 'serif',
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
            onClick={(e) => handleWordClick(e, word)}
          >
            {word}
          </Stack>{' '}
        </span>
      ))}

      <TextPopover anchorPosition={popoverPosition} onClose={handleClosePopover} />
    </Typography>
  );
};
