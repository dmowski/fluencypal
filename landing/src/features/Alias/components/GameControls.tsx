'use client';

import { useLingui } from '@lingui/react';
import { Stack, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SkipNextIcon from '@mui/icons-material/SkipNext';

interface GameControlsProps {
  onCorrect: () => void;
  onSkip: () => void;
}

export const GameControls = ({ onCorrect, onSkip }: GameControlsProps) => {
  const { i18n } = useLingui();
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} width="100%" maxWidth={520}>
      <Button
        variant="contained"
        color="success"
        size="large"
        startIcon={<CheckCircleIcon />}
        onClick={onCorrect}
        data-testid="button-correct"
        sx={{ flex: 1, py: 2, fontSize: '1.1rem' }}
      >
        {i18n._('Correct')}
      </Button>
      <Button
        variant="contained"
        color="warning"
        size="large"
        startIcon={<SkipNextIcon />}
        onClick={onSkip}
        data-testid="button-skip"
        sx={{ flex: 1, py: 2, fontSize: '1.1rem' }}
      >
        {i18n._('Skip')}
      </Button>
    </Stack>
  );
};
