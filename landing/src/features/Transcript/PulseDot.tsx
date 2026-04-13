import Stack from '@mui/material/Stack';

export const PulseDot = () => {
  return (
    <Stack
      sx={{
        width: 8,
        height: 8,
        borderRadius: '50%',
        backgroundColor: 'error.main',
        animation: 'pulse 1.2s ease-in-out infinite',
        '@keyframes pulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.3 },
        },
      }}
    />
  );
};
