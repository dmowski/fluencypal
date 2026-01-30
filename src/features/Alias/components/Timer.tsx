'use client';

import { Stack, Typography } from '@mui/material';

interface TimerProps {
  remainingSeconds: number;
}

export const Timer = ({ remainingSeconds }: TimerProps) => {
  return (
    <Stack alignItems="center" spacing={0.5} data-testid="timer">
      <Typography variant="subtitle2" color="text.secondary">
        Time left
      </Typography>
      <Typography variant="h4" fontWeight="bold">
        {remainingSeconds}s
      </Typography>
    </Stack>
  );
};
