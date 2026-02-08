'use client';
import { Stack, Typography } from '@mui/material';
import { CustomModal } from '../../uiKit/Modal/CustomModal';
import { useUsage } from '../useUsage';
import { useNotifications } from '@toolpad/core/useNotifications';
import { useRef, useState } from 'react';
import { useAuth } from '../../Auth/useAuth';
import { createStripeCheckout } from '../createStripeCheckout';
import { usePathname } from 'next/navigation';
import { supportedLanguages } from '@/features/Lang/lang';
import { useLingui } from '@lingui/react';
import { useCurrency } from '../../User/useCurrency';
import { sentPaymentTgMessage } from '../sentTgMessage';
import { FeatureList } from '../../Landing/Price/FeatureList';
import { useSettings } from '../../Settings/useSettings';
import { StripeCreateCheckoutRequest } from '@/common/requests';
import { sleep } from '@/libs/sleep';
import { useAnalytics } from '../../Analytics/useAnalytics';
import { useUrlState } from '../../Url/useUrlState';
import { PaymentSuccess } from '../HoursPaymentModal/PaymentSuccess';
import { FaqSubscription } from './FaqSubscription';
import { PriceContact } from '../HoursPaymentModal/PriceContact';
import { ConfirmPayment } from './ConfirmPayment';
import { SubscriptionDuration } from './types';
import { BalanceStatus } from './BalanceStatus';
import { usePrices } from './usePrices';
import { ActivePlanSelector } from './ActivePlanSelector';

export const SubscriptionPaymentModal = () => {
  const usage = useUsage();
  const auth = useAuth();
  const { i18n } = useLingui();
  const currency = useCurrency();
  const settings = useSettings();
  const appMode = settings.appMode;

  const notifications = useNotifications();
  const [isShowConfirmPayments, setIsShowConfirmPayments] = useState(false);

  const [isPaymentSuccess, setPaymentSuccess] = useUrlState('paymentSuccess', '', false);

  const pathname = usePathname();
  const locale = pathname?.split('/')[1] as string;
  const supportedLang = supportedLanguages.find((l) => l === locale) || 'en';

  const containerRef = useRef<HTMLDivElement | null>(null);

  const scrollTop = () => {
    containerRef.current?.parentElement?.parentElement?.parentElement?.scrollTo(0, 0);
  };

  const [isRedirecting, setIsRedirecting] = useState(false);
  const clickOnConfirmRequest = async () => {
    clickOnConfirmRequestStripe();
  };

  const openMainSubscriptionPage = () => {
    setIsShowConfirmPayments(false);
    scrollTop();
  };

  const [duration, setDuration] = useState<'day' | 'week' | 'month' | 'year'>('week');

  const prices = usePrices();
  const durationPriceUsd = prices[duration].usdPrice;

  const analytics = useAnalytics();

  const clickOnConfirmRequestStripe = async () => {
    const token = await auth.getToken();

    try {
      const dataToCheckout: StripeCreateCheckoutRequest = {
        userId: auth.uid,
        months: duration === 'month' ? 1 : duration === 'year' ? 12 : 0,
        days: duration === 'week' ? 7 : duration === 'day' ? 1 : 0,
        languageCode: supportedLang,
        currency: currency.currency,
      };

      setIsRedirecting(true);

      const checkoutInfo = await createStripeCheckout(dataToCheckout, token);

      await sentPaymentTgMessage({
        message: `Event: Redirect to stripe | ${duration}, ${currency.currency}`,
        email: auth?.userInfo?.email || 'unknownEmail',
        token,
      });
      analytics.confirmGtag();

      if (!checkoutInfo.sessionUrl) {
        setIsRedirecting(false);
        notifications.show(
          i18n._('Error creating payment session. Notification sent to support. Try again later.'),
          {
            severity: 'error',
          },
        );

        console.error('checkoutInfo', checkoutInfo);

        await sentPaymentTgMessage({
          message: 'Error during payment process',
          email: auth?.userInfo?.email || 'unknownEmail',
          token: await auth.getToken(),
        });

        await sleep(300);

        await sentPaymentTgMessage({
          message: 'Error during payment process' + checkoutInfo.error,
          email: auth?.userInfo?.email || 'unknownEmail',
          token: await auth.getToken(),
        });
        return;
      } else {
        window.location.href = checkoutInfo.sessionUrl;
      }
    } catch (error) {
      console.error('Error during payment process:', error);
      setIsRedirecting(false);
      notifications.show(i18n._('Error during payment process'), {
        severity: 'error',
      });
      await sentPaymentTgMessage({
        message: 'Error during payment process',
        email: auth?.userInfo?.email || 'unknownEmail',
        token: await auth.getToken(),
      });
    }
  };

  const showConfirmPage = async () => {
    setIsShowConfirmPayments(true);
    scrollTop();
    const isDevEmail = auth?.userInfo?.email?.includes('dmowski');
    if (isDevEmail) {
      return;
    }
  };

  if (!usage.isShowPaymentModal) return null;

  const closePaymentSuccessModal = async () => {
    await setPaymentSuccess('');
    await sleep(50);
    usage.togglePaymentModal(false);
  };

  const onSelectDuration = async (selectedDuration: SubscriptionDuration) => {
    setDuration(selectedDuration);
    await sleep(100);
    showConfirmPage();
  };

  if (isPaymentSuccess) {
    return (
      <CustomModal isOpen={!!isPaymentSuccess} onClose={closePaymentSuccessModal}>
        <PaymentSuccess onClose={closePaymentSuccessModal} />
      </CustomModal>
    );
  }

  return (
    <CustomModal
      isOpen={true && auth.isAuthorized}
      onClose={() => {
        if (isShowConfirmPayments) {
          openMainSubscriptionPage();
          return;
        }
        usage.togglePaymentModal(false);
      }}
    >
      <Stack
        sx={{
          width: '100%',
          maxWidth: '800px',
        }}
        ref={containerRef}
      >
        {isShowConfirmPayments ? (
          <ConfirmPayment
            duration={duration}
            durationPriceUsd={durationPriceUsd}
            clickOnConfirmRequest={() => clickOnConfirmRequest()}
            isRedirecting={isRedirecting}
          />
        ) : (
          <Stack
            sx={{
              width: '100%',
              boxSizing: 'border-box',
              gap: '80px',
            }}
          >
            <BalanceStatus />
            <ActivePlanSelector onSelectDuration={onSelectDuration} />

            <Stack gap="40px">
              <Stack
                sx={{
                  width: '100%',
                }}
              >
                <Typography variant="h6" component="h3" sx={{ marginBottom: '10px' }}>
                  {i18n._('What do you get with Full Access?')}
                </Typography>
                <FeatureList appMode={appMode} />
              </Stack>
              <Stack
                sx={{
                  gap: '60px',
                }}
              >
                <FaqSubscription />
                <PriceContact />
              </Stack>
            </Stack>
          </Stack>
        )}
      </Stack>
    </CustomModal>
  );
};
