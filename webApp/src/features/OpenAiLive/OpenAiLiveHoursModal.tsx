'use client';

import { useState } from 'react';
import { Stack, Step, StepButton, Stepper, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { ConfirmPaymentForm } from '@/features/Usage/HoursPaymentModal/ConfirmPaymentForm';
import { HourCard } from '@/features/Usage/HoursPaymentModal/HourCard';
import {
  OPEN_AI_LIVE_HOUR_PACKS,
  OpenAiLiveHourPack,
  creditUsdMicrosForHours,
  microsToUsd,
} from './pricing';
import { formatLocalFromUsd, formatUsdFromMicros } from './formatBalance';

export const OpenAiLiveHoursModal = ({
  currency,
  rate,
  buyingHours,
  error,
  onBuy,
  onClose,
}: {
  currency: string;
  rate: number;
  buyingHours: number | null;
  error: string | null;
  onBuy: (hours: OpenAiLiveHourPack) => void;
  onClose: () => void;
}) => {
  const { i18n } = useLingui();
  const [step, setStep] = useState(0);
  const [selectedHours, setSelectedHours] = useState<OpenAiLiveHourPack | null>(null);
  const steps = [i18n._('Hours'), i18n._('Payment')];

  const chooseHours = (hours: OpenAiLiveHourPack) => {
    if (buyingHours !== null) return;
    setSelectedHours(hours);
    setStep(1);
  };

  return (
    <CustomModal isOpen onClose={onClose} data-testid="open-ai-live-paywall">
      <Stack sx={{ width: '100%', maxWidth: '700px', gap: '40px' }}>
        <Stepper activeStep={step} sx={{ width: '100%' }}>
          {steps.map((label, index) => (
            <Step key={label} completed={step > index}>
              <StepButton
                onClick={() => {
                  if (index < step && buyingHours === null) setStep(index);
                }}
              >
                {label}
              </StepButton>
            </Step>
          ))}
        </Stepper>

        {step === 0 || selectedHours === null ? (
          <Stack sx={{ gap: '24px', width: '100%' }}>
            <Stack sx={{ gap: '6px' }}>
              <Typography variant="h5" component="h2">
                {i18n._('Add talking time')}
              </Typography>
              <Typography sx={{ opacity: 0.7 }}>
                {i18n._('Pick how many hours to add. The call ends when the balance runs out.')}
              </Typography>
            </Stack>
            <Stack
              sx={{
                width: '100%',
                gap: '20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                '@media (max-width: 600px)': {
                  gridTemplateColumns: '1fr',
                  gap: '28px',
                },
              }}
            >
              {OPEN_AI_LIVE_HOUR_PACKS.map((hours) => {
                const usd = microsToUsd(creditUsdMicrosForHours(hours));
                const local = formatLocalFromUsd(usd, currency, rate);
                return (
                  <Stack key={hours} data-testid={`open-ai-live-pack-${hours}`}>
                    <HourCard
                      onClick={() => chooseHours(hours)}
                      label={hours === 1 ? i18n._('1 hour') : i18n._('{hours} hours', { hours })}
                      content={formatUsdFromMicros(creditUsdMicrosForHours(hours))}
                      buttonTitle={
                        hours === 1
                          ? i18n._('Choose 1 hour')
                          : i18n._('Choose {hours} hours', { hours })
                      }
                      isRecommended={hours === 3}
                      footnote={local || i18n._('Talking time')}
                    />
                  </Stack>
                );
              })}
            </Stack>
          </Stack>
        ) : (
          <Stack sx={{ gap: '24px', width: '100%', alignItems: 'flex-start' }}>
            <Stack sx={{ width: '100%', gap: '6px' }}>
              <Typography variant="h5" component="h2">
                {i18n._('Confirm payment')}
              </Typography>
              <Typography sx={{ opacity: 0.7 }}>
                {selectedHours === 1
                  ? i18n._('Buying 1 hour of talking time')
                  : i18n._('Buying {hours} hours of talking time', { hours: selectedHours })}
              </Typography>
            </Stack>
            <ConfirmPaymentForm
              isRedirecting={buyingHours !== null}
              amountInUsd={microsToUsd(creditUsdMicrosForHours(selectedHours))}
              onConfirmRequest={() => onBuy(selectedHours)}
            />
            {error ? <Typography sx={{ color: '#ffb4b4' }}>{error}</Typography> : null}
          </Stack>
        )}
      </Stack>
    </CustomModal>
  );
};
