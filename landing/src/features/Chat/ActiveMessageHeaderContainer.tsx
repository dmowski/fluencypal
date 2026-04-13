import { Stack } from '@mui/material';

export const ActiveMessageHeaderContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Stack
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: '10px 10px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: 'rgba(255, 255, 255, 0.031)',
        borderRadius: '12px 12px 0 0',
        gap: '10px',
        width: '100%',
        justifyContent: 'space-between',
      }}
    >
      {children}
    </Stack>
  );
};
