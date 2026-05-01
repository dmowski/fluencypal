import { Typography } from '@mui/material';

export const ReaderParagraph = ({ text }: { text: string }) => (
  <Typography
    variant="body1"
    sx={{
      fontFamily: 'serif',
      fontSize: '36px',
      lineHeight: '1.5',
      textAlign: 'justify',
    }}
  >
    {text}
  </Typography>
);
