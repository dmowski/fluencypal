import { Stack } from '@mui/material';

export const ChatSectionContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Stack
      sx={{
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',

        '@media (max-width: 700px)': {
          borderRadius: '0px',
          border: 'none',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        },
      }}
    >
      {children}
    </Stack>
  );
};
