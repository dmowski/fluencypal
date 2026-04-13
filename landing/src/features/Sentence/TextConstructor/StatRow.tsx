import { Stack, Typography } from '@mui/material';

export const StatRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <Stack
      sx={{
        alignItems: 'center',
        flexDirection: 'row',
        gap: '5px',
        width: '100%',
      }}
    >
      <Typography
        sx={{
          fontSize: '13px',
          opacity: 1,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: '13px',
          opacity: 1,
          fontWeight: 700,
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
};
