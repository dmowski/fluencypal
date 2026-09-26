'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { sendAnalyticsEvent } from '@/features/Analytics/Custom/sendAnalyticsEvent';
import { PRICE_PER_DAY_USD } from '@/features/Price/price';
import { useCurrency } from '@/features/User/useCurrency';

export const DAY_PASS_OFFER_TEST_ID = 'day-pass-offer';
export const DAY_PASS_CHECKOUT_TEST_ID = 'day-pass-checkout';

export type DayPassNextLesson = {
  title: string;
  details: string;
};

export const DayPassLimitOffer = ({
  endAction,
  nextLesson,
}: {
  endAction: ReactNode;
  /** When set, the offer is the next plan lesson. Confirmation still opens before Stripe. */
  nextLesson?: DayPassNextLesson | null;
}) => {
  const { i18n } = useLingui();
  const currency = useCurrency();
  const router = useRouter();
  const price = currency.convertUsdToCurrency(PRICE_PER_DAY_USD);
  const title = nextLesson
    ? i18n._('Next: {title}', { title: nextLesson.title })
    : i18n._('Keep talking — {price} for the next 24 hours', { price });
  const subtitle = nextLesson
    ? nextLesson.details || i18n._('Lesson 1 is done. This is the next part of your plan.')
    : i18n._('Your free replies in this conversation are used.');
  const payLabel = nextLesson
    ? i18n._('Continue your plan — {price}', { price })
    : i18n._('Pay {price}', { price });

  useEffect(() => {
    sendAnalyticsEvent({ name: 'paywall_view', ctaId: 'day-pass' });
  }, []);

  const openDayPassPayment = () => {
    const params = new URLSearchParams(window.location.search);
    params.set('paymentModal', 'true');
    params.set('paymentDuration', 'day');
    params.set('paymentConfirm', 'true');
    router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <Stack
      data-testid={DAY_PASS_OFFER_TEST_ID}
      sx={{ width: '100%', maxWidth: '970px', gap: '25px' }}
    >
      <Stack sx={{ gap: '5px' }}>
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '2.5rem',
            lineHeight: '120%',
            '@media (max-width: 400px)': {
              fontSize: '2rem',
            },
          }}
        >
          {title}
        </Typography>
        <Typography sx={{ textWrap: 'balance' }}>{subtitle}</Typography>
      </Stack>
      <Stack
        sx={{
          width: '100%',
          flexDirection: 'row',
          gap: '10px 25px',
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <Button
          size="large"
          color="success"
          variant="contained"
          data-testid={DAY_PASS_CHECKOUT_TEST_ID}
          data-analytics="day-pass-checkout"
          sx={{
            backgroundColor: 'rgba(28, 212, 108, 0.78)',
            color: '#ddfff8',
            fontWeight: 600,
            borderRadius: '30px',
            minHeight: '48px',
            height: 'auto',
            lineHeight: '16px',
            whiteSpace: 'normal',
            textAlign: 'left',
          }}
          onClick={openDayPassPayment}
        >
          {payLabel}
        </Button>
        {endAction}
      </Stack>
    </Stack>
  );
};

export const NextPlanLessonScreen = ({
  nextLesson,
  onNotNow,
}: {
  nextLesson: DayPassNextLesson;
  onNotNow: () => void;
}) => {
  const { i18n } = useLingui();

  return (
    <Stack
      sx={{
        minHeight: '100dvh',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <DayPassLimitOffer
        nextLesson={nextLesson}
        endAction={
          <Button color="inherit" onClick={onNotNow}>
            {i18n._('Not now')}
          </Button>
        }
      />
    </Stack>
  );
};
