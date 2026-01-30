'use client';

import { Stack, Typography } from '@mui/material';

interface WordCounterProps {
  current: number;
  total: number;
}

export const WordCounter = ({ current, total }: WordCounterProps) => {
  return (
    <Stack alignItems="center" spacing={0.5} data-testid="word-counter">
      <Typography variant="subtitle2" color="text.secondary">
        Words
      </Typography>
      <Typography variant="h4" fontWeight="bold">
        {current}/{total}
      </Typography>
    </Stack>
  );
};
