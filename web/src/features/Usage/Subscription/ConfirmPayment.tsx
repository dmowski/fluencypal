import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';
import { ConfirmPaymentForm } from '../HoursPaymentModal/ConfirmPaymentForm';
import { FounderMessage } from '../HoursPaymentModal/FounderMessage';
import { SubscriptionDuration } from './types';

export const ConfirmPayment = ({
  subTitle,
  amountInUsd,
  clickOnConfirmRequest,
  isRedirecting,
}: {
  subTitle: string;
  amountInUsd: number;
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
          gap: '5px',
        }}
      >
        <Typography
          sx={{
            width: '100%',
            fontWeight: 800,
          }}
          variant="h3"
          component="h2"
        >
          {i18n._(`Confirm payment`)}
        </Typography>

        <Typography
          sx={{
            width: '100%',
            fontSize: '22px',
          }}
        >
          {subTitle}
        </Typography>
      </Stack>

      <ConfirmPaymentForm
        amountInUsd={amountInUsd}
        onConfirmRequest={() => clickOnConfirmRequest()}
        isRedirecting={isRedirecting}
      />
      {/* <FounderMessage /> */}
    </Stack>
  );
};
