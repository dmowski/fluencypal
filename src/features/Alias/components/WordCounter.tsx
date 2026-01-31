'use client';

import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';

interface WordCounterProps {
  current: number;
  total: number;
}

export const WordCounter = ({ current, total }: WordCounterProps) => {
  const { i18n } = useLingui();
  return (
    <Stack alignItems="center" spacing={0.5} data-testid="word-counter">
      <Typography variant="subtitle2" color="text.secondary">
        {i18n._('Words')}
      </Typography>
      <Typography variant="h4" fontWeight="bold">
        {i18n._(`{current}/{total}`, { current, total })}
      </Typography>
    </Stack>
  );
};
