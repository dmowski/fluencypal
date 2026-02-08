import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';
import { ConfirmPaymentForm } from '../HoursPaymentModal/ConfirmPaymentForm';
import { FounderMessage } from '../HoursPaymentModal/FounderMessage';
import { SubscriptionDuration } from './types';

export const ConfirmPayment = ({
  duration,
  durationPriceUsd,
  clickOnConfirmRequest,
  isRedirecting,
}: {
  duration: SubscriptionDuration;
  durationPriceUsd: number;
  clickOnConfirmRequest: () => void;
  isRedirecting: boolean;
}) => {
  const { i18n } = useLingui();

  return (
    <Stack
      sx={{
        maxWidth: '700px',
        width: '100%',
        boxSizing: 'border-box',
        gap: '40px',
        alignItems: 'center',
      }}
    >
      <Stack
        sx={{
          width: '100%',
        }}
      >
        <Typography
          sx={{
            width: '100%',
          }}
          variant="h5"
          component="h2"
        >
          {i18n._(`Confirm payment`)}
        </Typography>

        <Typography
          sx={{
            width: '100%',
            opacity: 0.7,
          }}
        >
          {duration === 'month'
            ? i18n._(`Full Access for 1 month`)
            : duration === 'week'
              ? i18n._(`Full Access for 1 week`)
              : duration === 'year'
                ? i18n._(`Full Access for 1 year`)
                : i18n._(`Full Access for 1 day`)}
        </Typography>
      </Stack>

      <ConfirmPaymentForm
        amountInUsd={durationPriceUsd}
        onConfirmRequest={() => clickOnConfirmRequest()}
        isRedirecting={isRedirecting}
      />
      <FounderMessage />
    </Stack>
  );
};
