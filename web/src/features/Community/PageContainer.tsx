import { Stack } from '@mui/material';

export const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Stack
      sx={{
        borderRadius: '12px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        padding: '15px 20px',
        boxSizing: 'border-box',

        '@media (max-width: 600px)': {
          padding: '15px',
          border: 'none',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: 0,
        },
      }}
    >
      {children}
    </Stack>
  );
};
