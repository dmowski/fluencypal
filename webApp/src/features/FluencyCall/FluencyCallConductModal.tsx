'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { ModalHeader } from '../uiKit/Modal/ModalHeader';

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
    <CustomModal
      isOpen
      onClose={isSaving ? undefined : onClose}
      zIndex={1400}
      backgroundColor="#1c1e24"
      data-testid="fluency-call-conduct"
    >
      <Stack sx={{ width: '100%', maxWidth: '600px', gap: '16px' }}>
        <ModalHeader
          title={i18n._('Before you join')}
          subtitle={i18n._(
            'These calls are a chance to practice with other learners. A few habits make them easier for everyone.',
          )}
        />
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
        <Stack
          direction="row"
          sx={{
            gap: '10px',
            position: 'sticky',
            bottom: 0,
            backgroundColor: 'rgba(28, 30, 35, 0.5)',
            backdropFilter: 'blur(10px)',
            padding: '16px',
          }}
        >
          <Button
            variant="contained"
            color="info"
            data-testid="fluency-call-conduct-agree"
            data-analytics="community-call-conduct-agree"
            onClick={onAgree}
            disabled={isSaving}
          >
            {i18n._('Agree')}
          </Button>
          <Button
            variant="text"
            data-testid="fluency-call-conduct-close"
            data-analytics="community-call-conduct-close"
            onClick={onClose}
            disabled={isSaving}
          >
            {i18n._('Close')}
          </Button>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
