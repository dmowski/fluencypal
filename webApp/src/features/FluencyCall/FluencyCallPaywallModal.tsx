'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useEffect } from 'react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { sendAnalyticsEvent } from '@/features/Analytics/Custom/sendAnalyticsEvent';
import { ConfirmPaymentForm } from '@/features/Usage/HoursPaymentModal/ConfirmPaymentForm';
import { FLUENCY_CALL_PRICE_USD } from './pricing';

export const FluencyCallPaywallModal = ({
  isRedirecting,
  error,
  onBuy,
  onClose,
}: {
  isRedirecting: boolean;
  error: string | null;
  onBuy: () => void;
  onClose: () => void;
}) => {
  const { i18n } = useLingui();

  useEffect(() => {
    sendAnalyticsEvent({ name: 'paywall_view', ctaId: 'fluency-call' });
  }, []);

  return (
    <CustomModal isOpen onClose={onClose} data-testid="fluency-call-paywall">
      <Stack sx={{ width: '100%', maxWidth: '560px', gap: '24px', alignItems: 'flex-start' }}>
        <Stack sx={{ gap: '6px' }}>
          <Typography variant="h5" component="h2">
            {i18n._('Group conversations')}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {i18n._('$2 per month')}
          </Typography>
          <Typography sx={{ opacity: 0.75 }}>
            {i18n._('One month of group conversations on Google Meet.')}
          </Typography>
        </Stack>
        <ConfirmPaymentForm
          isRedirecting={isRedirecting}
          amountInUsd={FLUENCY_CALL_PRICE_USD}
          analyticsId="community-call-checkout"
          onConfirmRequest={onBuy}
        />
        {error ? <Typography sx={{ color: '#ffb4b4' }}>{error}</Typography> : null}
      </Stack>
    </CustomModal>
  );
};
