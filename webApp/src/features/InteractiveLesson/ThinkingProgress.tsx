'use client';

import { useEffect, useState } from 'react';
import { LinearProgress, Stack, Typography } from '@mui/material';
import { THINKING_LABELS } from './constants';

export const ThinkingProgress = ({
  labels = THINKING_LABELS,
  variant = 'block',
}: {
  labels?: readonly string[];
  variant?: 'block' | 'inline';
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % labels.length);
    }, 1200);
    return () => window.clearInterval(timer);
  }, [labels]);

  return (
    <Typography
      variant="body2"
      className="loading-shimmer"
      data-testid="interactive-lesson-thinking"
    >
      {labels[index]}
    </Typography>
  );
};
