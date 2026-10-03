'use client';

import { useState } from 'react';
import { Box, Button, Stack, Step, StepButton, Stepper, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { ArrowRight, Info } from 'lucide-react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { ModalHeader } from '@/features/uiKit/Modal/ModalHeader';
import { ConfirmPaymentForm } from '@/features/Usage/HoursPaymentModal/ConfirmPaymentForm';
import {
  OPEN_AI_LIVE_HOUR_PACKS,
  OpenAiLiveHourPack,
  creditUsdMicrosForHours,
  microsToUsd,
  openAiLivePricePerMinuteUsdMicros,
} from './pricing';
import { formatApproxLocalFromUsd, formatCompactUsd, formatUsdFromMicros } from './formatBalance';

const surface = '#141920';
const text = '#eaf3f6';
const muted = '#9aabbc';
const meta = '#8b9bab';
const accent = '#53bef5';
const buttonBlue = '#36afed';

const PackRadio = ({ selected }: { selected: boolean }) => (
  <Box
    aria-hidden
    sx={{
      width: 16,
      height: 16,
      borderRadius: '50%',
      boxSizing: 'border-box',
      flexShrink: 0,
      border: selected ? 'none' : '2px solid #8a8a8a',
      backgroundColor: selected ? '#46b4ee' : 'transparent',
    }}
  />
);

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
  const [selectedHours, setSelectedHours] = useState<OpenAiLiveHourPack>(
    OPEN_AI_LIVE_HOUR_PACKS[0],
  );
  const steps = [i18n._('Hours'), i18n._('Payment')];
  const selectedUsd = microsToUsd(creditUsdMicrosForHours(selectedHours));
  const minutePrice = formatUsdFromMicros(openAiLivePricePerMinuteUsdMicros);

  return (
    <CustomModal
      isOpen
      onClose={onClose}
      backgroundColor={surface}
      desktopPadding="28px 20px"
      mobilePadding="20px 16px"
      data-testid="open-ai-live-paywall"
    >
      <Stack
        sx={{
          width: '100%',
          maxWidth: '700px',
          gap: step === 0 ? 0 : '40px',
        }}
      >
        {step === 0 ? (
          <Stack sx={{ width: '100%' }}>
            <ModalHeader
              title={i18n._('Add conversation time')}
              subtitle={i18n._("Choose how much time you'd like to add.")}
            />

            <Typography sx={{ marginTop: '28px', color: meta }}>
              {i18n._('Conversation time')}
            </Typography>

            <Box
              sx={{
                marginTop: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '12px',
                '@media (max-width: 600px)': {
                  gridTemplateColumns: '1fr',
                },
              }}
            >
              {OPEN_AI_LIVE_HOUR_PACKS.map((hours) => {
                const usd = microsToUsd(creditUsdMicrosForHours(hours));
                const local = formatApproxLocalFromUsd(usd, currency, rate);
                const selected = hours === selectedHours;
                const label = hours === 1 ? i18n._('1 hour') : i18n._('{hours} hours', { hours });
                return (
                  <Box
                    key={hours}
                    component="button"
                    type="button"
                    data-testid={`open-ai-live-pack-${hours}`}
                    aria-pressed={selected}
                    onClick={() => setSelectedHours(hours)}
                    sx={{
                      appearance: 'none',
                      font: 'inherit',
                      textAlign: 'left',
                      cursor: 'pointer',
                      width: '100%',
                      minHeight: '138px',
                      boxSizing: 'border-box',
                      borderRadius: '10px',
                      borderStyle: 'solid',
                      borderWidth: selected ? '2px' : '1px',
                      borderColor: selected ? accent : '#303c49',
                      backgroundColor: selected ? '#172a3b' : '#18202a',
                      padding: selected ? '16px' : '17px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch',
                      color: text,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                      }}
                    >
                      <Typography
                        component="span"
                        sx={{ fontSize: '18px', fontWeight: 700, lineHeight: 1.2, color: text }}
                      >
                        {label}
                      </Typography>
                      <PackRadio selected={selected} />
                    </Box>
                    <Typography
                      component="span"
                      sx={{
                        display: 'block',
                        marginTop: '18px',
                        fontSize: '28px',
                        fontWeight: 700,
                        lineHeight: 1.1,
                        color: text,
                      }}
                    >
                      {formatCompactUsd(usd)}
                    </Typography>
                    {local ? (
                      <Typography
                        component="span"
                        sx={{
                          display: 'block',
                          marginTop: '8px',
                          fontSize: '13px',
                          color: '#92a2b3',
                        }}
                      >
                        {local}
                      </Typography>
                    ) : null}
                  </Box>
                );
              })}
            </Box>

            <Typography variant="body2" sx={{ marginTop: '16px', color: meta }}>
              {i18n._('{price} per minute · Same rate for every pack', { price: minutePrice })}
            </Typography>

            <Stack
              direction="row"
              sx={{ marginTop: '18px', gap: '10px', alignItems: 'flex-start' }}
            >
              <Info
                size={16}
                color={meta}
                strokeWidth={1.75}
                style={{ marginTop: 2, flexShrink: 0 }}
              />
              <Stack sx={{ gap: '2px' }}>
                <Typography sx={{ fontSize: '14px', lineHeight: 1.45, color: muted }}>
                  {i18n._(
                    'For Advanced AI conversations only. This balance is separate from other balances.',
                  )}
                </Typography>
              </Stack>
            </Stack>

            <Box sx={{ marginTop: '22px', height: '1px', backgroundColor: '#28323e' }} />

            <Stack
              direction="row"
              sx={{
                marginTop: '20px',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <Stack sx={{ gap: '4px' }}>
                <Typography sx={{ fontSize: '13px', color: meta }}>
                  {i18n._("You're adding")}
                </Typography>
                <Typography sx={{ fontSize: '16px', fontWeight: 600, color: text }}>
                  {selectedHours === 1
                    ? i18n._('1 hour of conversation')
                    : i18n._('{hours} hours of conversation', { hours: selectedHours })}
                </Typography>
              </Stack>
              <Typography
                sx={{ fontSize: '22px', fontWeight: 700, color: text, whiteSpace: 'nowrap' }}
              >
                {formatUsdFromMicros(creditUsdMicrosForHours(selectedHours))} USD
              </Typography>
            </Stack>

            <Button
              fullWidth
              data-testid="open-ai-live-continue"
              onClick={() => setStep(1)}
              sx={{
                marginTop: '24px',
                backgroundColor: buttonBlue,
                color: '#0d1d27',
                fontWeight: 700,
                fontSize: '16px',
                textTransform: 'none',
                borderRadius: '8px',
                minHeight: '54px',
                gap: '8px',
                boxShadow: 'none',
                '&:hover': { backgroundColor: '#2ea3e0', boxShadow: 'none' },
              }}
            >
              {i18n._('Continue to payment')}
              <ArrowRight size={18} strokeWidth={2.25} />
            </Button>
          </Stack>
        ) : (
          <Stack sx={{ gap: '24px', width: '100%', alignItems: 'flex-start' }}>
            <ModalHeader
              title={i18n._('Confirm payment')}
              subtitle={
                selectedHours === 1
                  ? i18n._('Buying 1 hour of talking time')
                  : i18n._('Buying {hours} hours of talking time', { hours: selectedHours })
              }
            />
            <ConfirmPaymentForm
              isRedirecting={buyingHours !== null}
              amountInUsd={selectedUsd}
              onConfirmRequest={() => onBuy(selectedHours)}
            />
            {error ? <Typography sx={{ color: '#ffb4b4' }}>{error}</Typography> : null}
          </Stack>
        )}
      </Stack>
    </CustomModal>
  );
};
