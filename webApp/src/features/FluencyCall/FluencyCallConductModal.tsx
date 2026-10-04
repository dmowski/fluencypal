'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';

export const FluencyCallConductModal = ({
  onAgree,
  onClose,
  isSaving,
}: {
  onAgree: () => void;
  onClose: () => void;
  isSaving: boolean;
}) => {
  const { i18n } = useLingui();

  return (
    <Stack
      role="presentation"
      onClick={isSaving ? undefined : onClose}
      sx={{
        position: 'fixed',
        inset: 0,
        zIndex: 1400,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.72)',
      }}
    >
      <Stack
        role="dialog"
        aria-modal="true"
        aria-labelledby="fluency-call-conduct-title"
        data-testid="fluency-call-conduct"
        onClick={(event) => event.stopPropagation()}
        sx={{
          width: '100%',
          maxWidth: '600px',
          gap: '16px',
          padding: '34px',
          borderRadius: '16px',
          backgroundColor: '#1c1e24',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <Typography id="fluency-call-conduct-title" variant="h3" sx={{ fontWeight: 700 }}>
          {i18n._('Before you join')}
        </Typography>
        <Typography sx={{ opacity: 0.75 }}>
          {i18n._(
            'These calls are a chance to practice with other learners. A few habits make them easier for everyone.',
          )}
        </Typography>
        <Stack component="ul" sx={{ gap: '8px', margin: 0, paddingLeft: '18px' }}>
          {[
            i18n._('We speak English, even when the words come slowly.'),
            i18n._('We give each other time to finish.'),
            i18n._('Mistakes are welcome. We offer a correction only if someone asks.'),
            i18n._('We stay kind. Insults, flirting, and selling stay out of the conversation.'),
            i18n._('We join the Meet on time, and leave whenever we need to.'),
          ].map((rule) => (
            <Typography key={rule} component="li">
              {rule}
            </Typography>
          ))}
        </Stack>
        <Stack direction="row" sx={{ gap: '10px', justifyContent: 'flex-end' }}>
          <Button
            variant="text"
            data-testid="fluency-call-conduct-close"
            onClick={onClose}
            disabled={isSaving}
          >
            {i18n._('Close')}
          </Button>
          <Button
            variant="contained"
            color="info"
            data-testid="fluency-call-conduct-agree"
            onClick={onAgree}
            disabled={isSaving}
          >
            {i18n._('Agree')}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
};
