import { Typography } from '@mui/material';

export const ContactParagraph = ({ children }: { children: React.ReactNode }) => {
  return (
    <Typography
      align="left"
      variant="body1"
      sx={{
        maxWidth: '700px',
        fontSize: '1.2rem',
      }}
    >
      {children}
    </Typography>
  );
};
