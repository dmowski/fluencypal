'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';

export const FirstCallFinishedNotice = ({ onClose }: { onClose: () => void }) => {
  const { i18n } = useLingui();

  return (
    <Stack
      data-testid="onboarding-call-finished"
      sx={{ width: '100%', maxWidth: '970px', gap: '16px' }}
    >
      <Stack sx={{ gap: '6px' }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '2rem',
            lineHeight: '120%',
          }}
        >
          {i18n._('Free messages in this conversation are used')}
        </Typography>
        <Typography sx={{ textWrap: 'balance' }}>
          {i18n._(
            'Close to open your practice home. You can buy full access later, or keep going with reading, quizzes, and the game.',
          )}
        </Typography>
      </Stack>
      <Button
        size="large"
        variant="contained"
        data-testid="onboarding-call-close"
        onClick={onClose}
        sx={{
          alignSelf: 'flex-start',
          borderRadius: '30px',
          minHeight: '48px',
        }}
      >
        {i18n._('Close')}
      </Button>
    </Stack>
  );
};
