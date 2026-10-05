'use client';

import { redirectToStripeCheckout } from '@/features/Analytics/redirectToStripeCheckout';

import { useState } from 'react';
import { useNotifications } from '@toolpad/core/useNotifications';
import { useLingui } from '@lingui/react';
import { useAuth } from '@/features/Auth/useAuth';
import { sendAnalyticsEvent } from '@/features/Analytics/Custom/sendAnalyticsEvent';
import { useCurrency } from '@/features/User/useCurrency';
import { useSettings } from '@/features/Settings/useSettings';
import { PaidAccessPlanId } from '@/features/Price/paidAccessPlans';
import { createStripeCheckout } from '../createStripeCheckout';
import { sentPaymentTgMessage } from '../sentTgMessage';
import { startDayPassCheckout } from '../dayPassCheckout';
import { StripeCreateCheckoutRequest } from '../stripe.types';
import { SubscriptionDuration } from './types';

export const usePaidAccessCheckout = () => {
  const auth = useAuth();
  const { i18n } = useLingui();
  const currency = useCurrency();
  const settings = useSettings();
  const notifications = useNotifications();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const supportedLang = settings.pageLanguageCode || 'en';

  const reportCheckoutError = async (checkoutError?: string) => {
    setIsRedirecting(false);
    notifications.show(
      i18n._('Error creating payment session. Notification sent to support. Try again later.'),
      { severity: 'error' },
    );
    const token = await auth.getToken();
    await sentPaymentTgMessage({
      message: checkoutError
        ? `Error during payment process${checkoutError}`
        : 'Error during payment process',
      email: auth?.userInfo?.email || 'unknownEmail',
      token,
    });
  };

  const confirmPaidAccess = async (plan: PaidAccessPlanId, duration: SubscriptionDuration) => {
    if (!auth.isIdentified) return;

    const token = await auth.getToken();
    const dataToCheckout: StripeCreateCheckoutRequest = {
      userId: auth.uid,
      months: duration === 'month' ? 1 : duration === 'year' ? 12 : 0,
      days: duration === 'week' ? 7 : duration === 'day' ? 1 : 0,
      plan,
      languageCode: supportedLang,
      currency: currency.currency,
    };

    try {
      setIsRedirecting(true);
      sendAnalyticsEvent({ name: 'checkout_start', ctaId: 'subscription' });
      const checkoutInfo = await createStripeCheckout(dataToCheckout, token);

      await sentPaymentTgMessage({
        message: `Event: Redirect to stripe | ${plan} ${duration}, ${currency.currency}`,
        email: auth?.userInfo?.email || 'unknownEmail',
        token,
      });

      if (!checkoutInfo.sessionUrl) {
        console.error('checkoutInfo', checkoutInfo);
        await reportCheckoutError(checkoutInfo.error || undefined);
        return;
      }

      await redirectToStripeCheckout(checkoutInfo.sessionUrl);
    } catch (error) {
      console.error('Error during payment process:', error);
      setIsRedirecting(false);
      notifications.show(i18n._('Error during payment process'), { severity: 'error' });
      await sentPaymentTgMessage({
        message: 'Error during payment process',
        email: auth?.userInfo?.email || 'unknownEmail',
        token: await auth.getToken(),
      });
    }
  };

  const confirmDayPass = async () => {
    if (!auth.isIdentified || !auth.uid) return;

    const token = await auth.getToken();

    try {
      setIsRedirecting(true);
      const sessionUrl = await startDayPassCheckout({
        userId: auth.uid,
        token,
        languageCode: supportedLang,
        currency: currency.currency,
        email: auth.userInfo?.email,
      });

      if (!sessionUrl) {
        setIsRedirecting(false);
        notifications.show(
          i18n._('Error creating payment session. Notification sent to support. Try again later.'),
          { severity: 'error' },
        );
        return;
      }

      await redirectToStripeCheckout(sessionUrl);
    } catch (error) {
      console.error('Error during payment process:', error);
      setIsRedirecting(false);
      notifications.show(i18n._('Error during payment process'), { severity: 'error' });
    }
  };

  return { isRedirecting, confirmPaidAccess, confirmDayPass };
};
