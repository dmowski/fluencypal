'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';

export const OpenAiLiveBalanceEndedModal = ({
  onBuyHours,
  onClose,
}: {
  onBuyHours: () => void;
  onClose: () => void;
}) => {
  const { i18n } = useLingui();

  return (
    <CustomModal isOpen onClose={onClose} data-testid="open-ai-live-balance-ended">
      <Stack sx={{ width: '100%', maxWidth: '700px', gap: '40px' }}>
        <Stack sx={{ gap: '6px' }}>
          <Typography variant="h3" component="h2" sx={{ fontWeight: 700 }}>
            {i18n._("That's all the time for now")}
          </Typography>
          <Typography sx={{ opacity: 0.7 }}>
            {i18n._(
              'The call paused because the balance is empty. Add more hours if you want to keep talking',
            )}
          </Typography>
        </Stack>
        <Stack sx={{ gap: '12px', alignItems: 'center', flexDirection: 'row' }}>
          <Button
            data-testid="open-ai-live-balance-ended-buy"
            color="info"
            variant="contained"
            size="large"
            onClick={onBuyHours}
            sx={{ padding: '12px 40px', fontWeight: 600 }}
          >
            {i18n._('Add more hours')}
          </Button>
          <Button
            data-testid="open-ai-live-balance-ended-close"
            color="inherit"
            onClick={onClose}
            sx={{ padding: '12px 40px', fontWeight: 600 }}
          >
            {i18n._('Not now')}
          </Button>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
