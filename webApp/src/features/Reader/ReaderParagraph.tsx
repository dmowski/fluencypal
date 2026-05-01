import { Stack, Typography } from '@mui/material';
import { splitWords } from '../Sentence/TextConstructor/textConstructor.utils';

export const ReaderParagraph = ({
  text,
  onWordClick,
  onTextSelected,
}: {
  text: string;
  onWordClick: (word: string) => void;
  onTextSelected: (selectedText: string) => void;
}) => {
  const words = splitWords(text);

  const handleMouseUp = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() ?? '';
    if (selectedText) {
      onTextSelected(selectedText);
    }
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
            onClick={() => onWordClick(word)}
          >
            {word}
          </Stack>{' '}
        </span>
      ))}
    </Typography>
  );
};
