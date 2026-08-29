'use client';

import { useEffect, useState } from 'react';
import { LinearProgress, Stack, Typography } from '@mui/material';
import { THINKING_LABELS } from './constants';

export const ThinkingProgress = ({ labels = THINKING_LABELS }: { labels?: readonly string[] }) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % labels.length);
    }, 1200);
    return () => window.clearInterval(timer);
  }, [labels]);

  return (
    <Stack sx={{ gap: '8px', width: '100%' }} data-testid="interactive-lesson-thinking">
      <Typography variant="body2" sx={{ opacity: 0.85 }} className="loading-shimmer">
        {labels[index]}
      </Typography>
      <LinearProgress color="info" />
    </Stack>
  );
};
