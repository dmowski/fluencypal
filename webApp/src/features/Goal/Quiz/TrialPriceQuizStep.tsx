'use client';

import { InfoStep } from '@/features/Survey/InfoStep';
import { PRICE_PER_MONTH_USD, TRIAL_DAYS } from '@/features/Price/price';
import { useCurrency } from '@/features/User/useCurrency';
import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';
import { ShieldCheck, Sparkles } from 'lucide-react';

export const TrialPriceQuizStep = ({
  next,
  isStepLoading,
  trialDays = TRIAL_DAYS,
  pricePerMonthUsd = PRICE_PER_MONTH_USD,
}: {
  next: () => void;
  isStepLoading?: boolean;
  trialDays?: number;
  pricePerMonthUsd?: number;
}) => {
  const { i18n } = useLingui();
  const currency = useCurrency();
  const monthlyPrice = currency.convertUsdToCurrency(pricePerMonthUsd);
  const showTrialBadge = trialDays > 0;

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
          {showTrialBadge && (
            <Stack
              data-testid="trial-price-badge"
              sx={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: '8px',
                width: 'fit-content',
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(0, 255, 163, 0.12)',
                border: '1px solid rgba(0, 255, 163, 0.35)',
              }}
            >
              <Sparkles size={18} color="rgb(167, 243, 208)" />
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                }}
              >
                {i18n._('{days}-day trial with full access', { days: trialDays })}
              </Typography>
            </Stack>
          )}

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
