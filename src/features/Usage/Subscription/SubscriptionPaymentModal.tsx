'use client';
import { Button, ButtonGroup, Stack, Typography } from '@mui/material';
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
import { PRICE_PER_DAY_USD, PRICE_PER_MONTH_USD } from '@/common/subscription';
import { sentPaymentTgMessage } from '../sentTgMessage';
import dayjs from 'dayjs';
import { FeatureList } from '../../Landing/Price/FeatureList';
import { useSettings } from '../../Settings/useSettings';
import { StripeCreateCheckoutRequest } from '@/common/requests';
import { sleep } from '@/libs/sleep';
import { Check, Plus } from 'lucide-react';
import { useAnalytics } from '../../Analytics/useAnalytics';
import { useUrlState } from '../../Url/useUrlState';
import { PaymentSuccess } from '../HoursPaymentModal/PaymentSuccess';
import { FaqSubscription } from './FaqSubscription';
import { PriceContact } from '../HoursPaymentModal/PriceContact';
import { ConfirmPayment } from './ConfirmPayment';

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

  const yearPrice = PRICE_PER_MONTH_USD * 12;

  const durationPriceUsd =
    duration === 'month'
      ? PRICE_PER_MONTH_USD
      : duration === 'day'
        ? PRICE_PER_DAY_USD
        : duration === 'year'
          ? yearPrice
          : PRICE_PER_DAY_USD * 7;

  const priceInCurrency = Math.round(currency.rate * durationPriceUsd * 10) / 10;

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
        setIsRedirecting(false);
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

  const isActiveSubscription = usage.isFullAccess;
  const isTrial = !usage.paymentLogs?.find((log) => log.type === 'user' || 'subscription-full-v1');
  const activeTill = usage.activeSubscriptionTill
    ? `${dayjs(usage.activeSubscriptionTill).format('DD MMMM')}`
    : null;

  if (!usage.isShowPaymentModal) return null;

  const closePaymentSuccessModal = async () => {
    await setPaymentSuccess('');
    await sleep(50);
    usage.togglePaymentModal(false);
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
          maxWidth: '600px',
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
          <>
            <Stack
              sx={{
                width: '100%',
                boxSizing: 'border-box',
                gap: '40px',
                alignItems: 'center',
              }}
            >
              <Stack
                sx={{
                  gap: '5px',
                }}
              >
                <Typography align="center" variant="h5" component="h2">
                  {i18n._(`Full Access`)}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.8,
                  }}
                  align="center"
                >
                  {!isActiveSubscription && <>{i18n._(`You do not have full access.`)}</>}

                  {isActiveSubscription && !isTrial && activeTill && (
                    <>
                      {i18n._(`Your full access is active until`)} <b>{activeTill || '-'}</b>
                    </>
                  )}

                  {isActiveSubscription && !isTrial && !activeTill && (
                    <>
                      {i18n._(`You have`)} <b>{usage.balanceHours.toFixed(1)}</b>{' '}
                      {i18n._(`AI hours left in your balance.`)}
                    </>
                  )}
                </Typography>
              </Stack>

              <Stack
                sx={{
                  borderRadius: '18px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backgroundColor: '#212121',
                  maxWidth: '400px',
                  width: '100%',
                }}
              >
                <Stack
                  sx={{
                    padding: '24px',
                    gap: '20px',
                  }}
                >
                  <Stack
                    sx={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <Typography variant="h6">{i18n._(`Full Access`)}</Typography>
                    {activeTill && (
                      <Stack
                        sx={{
                          padding: '3px 17px 3px 12px',
                          borderRadius: '18px',
                          backgroundColor: 'rgba(5, 172, 255, 0.4 )',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexDirection: 'row',
                          gap: '6px',
                        }}
                      >
                        <Check size={'18px'} />
                        <Typography
                          variant="body2"
                          sx={{
                            padding: 0,
                            margin: 0,
                            color: '#fff',
                            fontWeight: 600,
                          }}
                        >
                          {i18n._(`Active`)}
                        </Typography>
                      </Stack>
                    )}
                  </Stack>

                  <Stack sx={{ gap: '20px' }}>
                    <Stack
                      sx={{
                        width: '100%',
                        gap: '5px',
                        //display: "none",
                      }}
                    >
                      <Typography
                        sx={{
                          width: '100%',
                        }}
                        variant="caption"
                      >
                        {i18n._('Duration:')}
                      </Typography>
                      <ButtonGroup
                        aria-label="Basic button group"
                        sx={{
                          width: '100%',
                        }}
                      >
                        <Button
                          fullWidth
                          variant={duration === 'day' ? 'contained' : 'outlined'}
                          onClick={() => setDuration('day')}
                        >
                          {i18n._('Day')}
                        </Button>
                        <Button
                          fullWidth
                          variant={duration === 'week' ? 'contained' : 'outlined'}
                          onClick={() => setDuration('week')}
                        >
                          {i18n._('Week')}
                        </Button>
                        <Button
                          fullWidth
                          variant={duration === 'month' ? 'contained' : 'outlined'}
                          onClick={() => setDuration('month')}
                        >
                          {i18n._('Month')}
                        </Button>
                        <Button
                          fullWidth
                          variant={duration === 'year' ? 'contained' : 'outlined'}
                          onClick={() => setDuration('year')}
                        >
                          {i18n._('Year')}
                        </Button>
                      </ButtonGroup>
                    </Stack>

                    <Stack
                      sx={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 500,
                          fontSize: '3.6rem',
                        }}
                      >
                        {priceInCurrency}
                      </Typography>
                      <Stack
                        sx={{
                          paddingTop: '18px',
                          height: '100%',
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            textTransform: 'uppercase',
                          }}
                        >
                          {currency.currency} /
                        </Typography>
                        <Typography variant="caption">
                          {duration === 'month'
                            ? i18n._('month')
                            : duration === 'week'
                              ? i18n._('week')
                              : duration === 'year'
                                ? i18n._('year')
                                : i18n._('day')}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Stack>

                  <Typography variant="body1">
                    {i18n._('Get confidence with AI support')}
                  </Typography>
                  <Stack
                    sx={{
                      gap: '5px',
                    }}
                  >
                    {!activeTill && (
                      <Button
                        color="info"
                        variant="contained"
                        size="large"
                        onClick={showConfirmPage}
                      >
                        {i18n._(`Get Full Access`)}
                      </Button>
                    )}

                    {activeTill && (
                      <Button
                        color="info"
                        variant="outlined"
                        size="large"
                        startIcon={<Plus />}
                        onClick={showConfirmPage}
                      >
                        {i18n._(`Buy More`)}
                      </Button>
                    )}

                    {activeTill && (
                      <>
                        <Typography variant="body2" align="left">
                          {i18n._(`Your full access is active until {activeTill}`, {
                            activeTill: activeTill,
                          })}
                        </Typography>
                        <Typography
                          variant="body2"
                          align="left"
                          sx={{
                            paddingBottom: '10px',
                          }}
                        >
                          {i18n._(
                            `You can renew your full access any time before it expires to avoid
                          interruption of service.`,
                          )}
                        </Typography>
                      </>
                    )}
                  </Stack>
                  <FeatureList appMode={appMode} />
                </Stack>
              </Stack>

              <FaqSubscription />
              <PriceContact />
            </Stack>
          </>
        )}
      </Stack>
    </CustomModal>
  );
};
