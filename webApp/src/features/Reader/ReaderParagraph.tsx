import { Stack, Typography } from '@mui/material';
import { splitWords } from '../Sentence/TextConstructor/textConstructor.utils';

export const ReaderParagraph = ({
  text,
  onWordClick,
}: {
  text: string;
  onWordClick: (word: string) => void;
}) => {
  const words = splitWords(text);

  return (
    <Typography
      variant="body1"
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
