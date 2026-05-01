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

  const handleMouseUp = () => {
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
              ':hover': {
                borderBottom: '2px dotted #333',
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
