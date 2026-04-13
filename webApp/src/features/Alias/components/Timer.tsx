'use client';

import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';

interface TimerProps {
  remainingSeconds: number;
}

export const Timer = ({ remainingSeconds }: TimerProps) => {
  const { i18n } = useLingui();
  return (
    <Stack alignItems="center" spacing={0.5} data-testid="timer">
      <Typography variant="subtitle2" color="text.secondary">
        {i18n._('Time left')}
      </Typography>
      <Typography variant="h4" fontWeight="bold">
        {i18n._(`{seconds}s`, { seconds: remainingSeconds })}
      </Typography>
    </Stack>
  );
};
