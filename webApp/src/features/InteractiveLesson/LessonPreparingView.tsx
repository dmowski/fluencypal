'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { LoadingShapes } from '@/features/uiKit/Loading/LoadingShapes';

export const LessonPreparingView = () => {
  const { i18n } = useLingui();

  return (
    <Stack sx={{ gap: '20px' }} data-testid="interactive-lesson-preparing">
      <Typography
        variant="caption"
        sx={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}
      >
        {i18n._('We are preparing a lesson for you. Based on your previous interaction.')}
      </Typography>
      <LoadingShapes sizes={['30px', '200px', '30px', '140px', '200px']} />
    </Stack>
  );
};
