'use client';

import { LinearProgress, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';

export const QuizProgressBar = ({
  current,
  total,
}: {
  current: number;
  total: number;
}) => {
  const { i18n } = useLingui();
  const percent = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <Stack sx={{ gap: '6px', width: '100%', padding: '0 15px 8px' }} data-testid="quiz-progress">
      <Typography variant="caption" sx={{ opacity: 0.8 }}>
        {i18n._('Question {current} of {total}', { current, total })}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={percent}
        sx={{
          height: '6px',
          borderRadius: '3px',
          backgroundColor: 'rgba(255,255,255,0.12)',
          '& .MuiLinearProgress-bar': {
            backgroundColor: '#5dade2',
            borderRadius: '3px',
          },
        }}
      />
    </Stack>
  );
};
