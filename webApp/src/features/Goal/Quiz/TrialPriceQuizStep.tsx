'use client';

import { InfoStep } from '@/features/Survey/InfoStep';
import { PRICE_PER_MONTH_USD } from '@/features/Price/price';
import { useCurrency } from '@/features/User/useCurrency';
import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';
import { ShieldCheck } from 'lucide-react';

export const TrialPriceQuizStep = ({
  next,
  isStepLoading,
  pricePerMonthUsd = PRICE_PER_MONTH_USD,
}: {
  next: () => void;
  isStepLoading?: boolean;
  /** @deprecated Trial removed; kept for call-site compatibility. */
  trialDays?: number;
  pricePerMonthUsd?: number;
}) => {
  const { i18n } = useLingui();
  const currency = useCurrency();
  const monthlyPrice = currency.convertUsdToCurrency(pricePerMonthUsd);

  return (
    <InfoStep
      title={i18n._(`Simple pricing`)}
      subComponent={
        <Stack
          sx={{
            paddingTop: '24px',
            gap: '20px',
          }}
        >
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              gap: '8px',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                lineHeight: 1,
                fontSize: '2.4rem',
              }}
            >
              {monthlyPrice}
            </Typography>
            <Typography
              sx={{
                opacity: 0.75,
                paddingBottom: '4px',
              }}
            >
              {i18n._('per month')}
            </Typography>
          </Stack>

          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              gap: '10px',
            }}
          >
            <ShieldCheck size={20} color="rgb(231, 235, 252)" />
            <Typography sx={{ opacity: 0.95 }}>
              {i18n._('Refund anytime from Profile. Automatic, no time limit.')}
            </Typography>
          </Stack>
        </Stack>
      }
      actionButtonTitle={i18n._('OK')}
      onClick={next}
      disabled={isStepLoading}
      isStepLoading={isStepLoading}
    />
  );
};
