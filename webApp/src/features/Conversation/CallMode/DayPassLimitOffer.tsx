'use client';

import Google from '@mui/icons-material/Google';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/features/Auth/useAuth';
import { sendAnalyticsEvent } from '@/features/Analytics/Custom/sendAnalyticsEvent';
import { PRICE_PER_DAY_USD } from '@/features/Price/price';
import { useSettings } from '@/features/Settings/useSettings';
import { useCurrency } from '@/features/User/useCurrency';
import {
  clearDayPassCheckout,
  markDayPassCheckout,
  startDayPassCheckout,
} from '@/features/Usage/dayPassCheckout';

export const DAY_PASS_OFFER_TEST_ID = 'day-pass-offer';
export const DAY_PASS_CHECKOUT_TEST_ID = 'day-pass-checkout';
export const DAY_PASS_GOOGLE_TEST_ID = 'day-pass-google';

export const DayPassLimitOffer = ({ endAction }: { endAction: ReactNode }) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const settings = useSettings();
  const currency = useCurrency();
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');
  const price = currency.convertUsdToCurrency(PRICE_PER_DAY_USD);
  const title = i18n._('Keep talking — {price} for today', { price });

  useEffect(() => {
    sendAnalyticsEvent({ name: 'paywall_view', ctaId: 'day-pass' });
  }, []);

  const checkout = async () => {
    setError('');
    setIsBusy(true);
    const token = await auth.getToken();
    const sessionUrl = await startDayPassCheckout({
      userId: auth.uid,
      token,
      languageCode: settings.pageLanguageCode,
      currency: currency.currency,
      email: auth.userInfo?.email,
    });
    if (!sessionUrl) {
      setIsBusy(false);
      setError(
        i18n._('Error creating payment session. Notification sent to support. Try again later.'),
      );
      return;
    }
    window.location.assign(sessionUrl);
  };

  const signInAndCheckout = async () => {
    setError('');
    setIsBusy(true);
    markDayPassCheckout();
    const result = await auth.signInWithGoogle();
    if (result.isRedirecting) return;
    if (!result.isDone) {
      clearDayPassCheckout();
      setIsBusy(false);
      if (result.error) setError(result.error);
      return;
    }
    clearDayPassCheckout();
    await checkout();
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
        <Typography sx={{ textWrap: 'balance' }}>
          {i18n._('Your free replies in this conversation are used.')}
        </Typography>
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
        {auth.isIdentified ? (
          <Button
            size="large"
            color="success"
            variant="contained"
            disabled={isBusy}
            data-testid={DAY_PASS_CHECKOUT_TEST_ID}
            data-analytics="day-pass-checkout"
            sx={{
              backgroundColor: 'rgba(28, 212, 108, 0.78)',
              color: '#ddfff8',
              fontWeight: 600,
              borderRadius: '30px',
              height: '48px',
              lineHeight: '16px',
            }}
            onClick={() => void checkout()}
          >
            {isBusy ? i18n._('Loading...') : title}
          </Button>
        ) : (
          <Button
            size="large"
            color="success"
            variant="contained"
            disabled={isBusy}
            startIcon={<Google />}
            data-testid={DAY_PASS_GOOGLE_TEST_ID}
            data-analytics="auth-google"
            sx={{
              backgroundColor: 'rgba(28, 212, 108, 0.78)',
              color: '#ddfff8',
              fontWeight: 600,
              borderRadius: '30px',
              height: '48px',
              lineHeight: '16px',
            }}
            onClick={() => void signInAndCheckout()}
          >
            {isBusy ? i18n._('Signing in...') : i18n._('Sign in with Google')}
          </Button>
        )}
        {endAction}
      </Stack>
      {error ? (
        <Typography color="error" role="alert">
          {error}
        </Typography>
      ) : null}
    </Stack>
  );
};
