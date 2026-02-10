'use client';
import { Button, ButtonGroup, Stack, Typography } from '@mui/material';
import { CustomModal } from '../../uiKit/Modal/CustomModal';
import { useUsage } from '../useUsage';
import { useNotifications } from '@toolpad/core/useNotifications';
import { useRef, useState } from 'react';
import { useAuth } from '../../Auth/useAuth';
import { createStripeCheckout } from '../createStripeCheckout';
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
import { HoursPackage, SubscriptionDuration } from './types';
import { BalanceStatus } from './BalanceStatus';
import { usePrices } from './usePrices';
import { ActivePlanSelector } from './ActivePlanSelector';
import { HoursSelector } from '../HoursPaymentModal/HourseSelector';
import { pricePerHourUsd } from '@/common/ai';
import { ColorIconTextList } from '@/features/Survey/ColorIconTextList';
import { X } from 'lucide-react';
import dayjs from 'dayjs';

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
  const supportedLang = settings.pageLanguageCode || 'en';
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [amountHoursToAdd, setAmountHoursToAdd] = useState<0 | HoursPackage>(0);

  const scrollTop = () => {
    containerRef.current?.parentElement?.parentElement?.parentElement?.scrollTo(0, 0);
  };

  const [isRedirecting, setIsRedirecting] = useState(false);
  const [usageType, setUsageType] = useState<'subscription' | 'hours' | 'free'>('subscription');

  const openMainSubscriptionPage = () => {
    setIsShowConfirmPayments(false);
    scrollTop();
  };

  const [subscriptionDuration, setSubscriptionDuration] = useState<SubscriptionDuration>('week');
  const price = usePrices();

  const analytics = useAnalytics();

  const onSelectHourPackage = async (hours: HoursPackage) => {
    setAmountHoursToAdd(hours);
    await sleep(50);
    setIsShowConfirmPayments(true);
  };

  type confirmSubscriptionParams =
    | {
        selectedSubscriptionDuration: SubscriptionDuration;
      }
    | {
        amountHoursToAdd: HoursPackage;
      };

  const confirmSubscription = async (props: confirmSubscriptionParams) => {
    const token = await auth.getToken();

    try {
      const dataToCheckout: StripeCreateCheckoutRequest =
        'selectedSubscriptionDuration' in props
          ? {
              userId: auth.uid,
              months:
                props.selectedSubscriptionDuration === 'month'
                  ? 1
                  : props.selectedSubscriptionDuration === 'year'
                    ? 12
                    : 0,
              days:
                props.selectedSubscriptionDuration === 'week'
                  ? 7
                  : props.selectedSubscriptionDuration === 'day'
                    ? 1
                    : 0,
              languageCode: supportedLang,
              currency: currency.currency,
            }
          : {
              userId: auth.uid,
              amountOfHours: props.amountHoursToAdd,
              languageCode: settings.pageLanguageCode,
              currency: currency.currency,
            };

      setIsRedirecting(true);

      const checkoutInfo = await createStripeCheckout(dataToCheckout, token);

      const tgInfo =
        'selectedSubscriptionDuration' in props
          ? props.selectedSubscriptionDuration
          : `${props.amountHoursToAdd} hours`;

      await sentPaymentTgMessage({
        message: `Event: Redirect to stripe | ${tgInfo}, ${currency.currency}`,
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
    setSubscriptionDuration(selectedDuration);
    setAmountHoursToAdd(0);
    await sleep(100);
    showConfirmPage();
  };

  const confirmAmountUsd = amountHoursToAdd
    ? amountHoursToAdd * pricePerHourUsd
    : price.subscriptionPrices[subscriptionDuration].usdPrice;

  const hoursLabels: Record<HoursPackage, string> = {
    1: i18n._('Buy 1 AI hour'),
    3: i18n._('Buy 3 AI hours'),
    5: i18n._('Buy 5 AI hours'),
  };

  const expiring = price.subscriptionPrices[subscriptionDuration].expiringDateIso;
  const expiringFormatted = dayjs(expiring).locale(supportedLang).format('D MMMM');

  const durationLabels: Record<SubscriptionDuration, string> = {
    day: i18n._('1 day'),
    week: i18n._('1 week'),
    month: i18n._('1 month'),
    year: i18n._('1 year'),
  };
  const label = subscriptionDuration ? durationLabels[subscriptionDuration] : '';

  const confirmationSubTitle = amountHoursToAdd
    ? hoursLabels[amountHoursToAdd]
    : i18n._(`Full access until {tillDate}`, { tillDate: expiringFormatted }) + '. (' + label + ')';

  const onConfirm = () => {
    if (amountHoursToAdd) {
      confirmSubscription({ amountHoursToAdd });
    } else {
      confirmSubscription({ selectedSubscriptionDuration: subscriptionDuration });
    }
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
          maxWidth: '1200px',
        }}
        ref={containerRef}
      >
        {isShowConfirmPayments ? (
          <ConfirmPayment
            amountInUsd={confirmAmountUsd}
            subTitle={confirmationSubTitle}
            clickOnConfirmRequest={onConfirm}
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
            <Stack
              sx={{
                gap: '20px',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                }}
              >
                {i18n._('How to get Full Access?')}
              </Typography>
              <Stack
                sx={{
                  width: '100%',
                  display: 'none',
                }}
              >
                <ButtonGroup>
                  <Button
                    onClick={() => setUsageType('subscription')}
                    variant={usageType === 'subscription' ? 'contained' : 'outlined'}
                  >
                    {i18n._('Non-renewing subscription')}
                  </Button>
                  <Button
                    onClick={() => setUsageType('hours')}
                    variant={usageType === 'hours' ? 'contained' : 'outlined'}
                  >
                    {i18n._('AI tokens')}
                  </Button>
                </ButtonGroup>
              </Stack>
              {usageType === 'subscription' ? (
                <Stack
                  sx={{
                    gap: '10px',
                  }}
                >
                  <Typography
                    sx={{
                      maxWidth: '700px',
                    }}
                  >
                    {i18n._(
                      `Subscriptions don’t auto-renew, so you can try FluencyPal with no long-term commitment.`,
                    )}
                  </Typography>
                  <ActivePlanSelector onSelectDuration={onSelectDuration} />
                </Stack>
              ) : usageType === 'hours' ? (
                <Stack
                  sx={{
                    gap: '25px',
                  }}
                >
                  <Stack>
                    <ColorIconTextList
                      gap="12px"
                      iconSize="18px"
                      listItems={[
                        {
                          title: i18n._(`Buy AI tokens and use them whenever you want.`),
                          iconName: 'star',
                        },
                        {
                          title: i18n._(`1 AI hour ≈ 1 hour of active conversation with the AI.`),
                          iconName: 'hourglass',
                        },
                        {
                          title: i18n._(
                            `You get full access, just like a subscription — but with complete flexibility.`,
                          ),
                          iconName: 'biceps-flexed',
                        },
                        {
                          title: i18n._(
                            `Use it on weekends, for a short project, or whenever it fits you.`,
                          ),
                          iconName: 'sprout',
                        },
                        {
                          title: i18n._(`Tokens don’t expire, so you can save them for later.`),
                          iconName: 'landmark',
                        },
                      ]}
                    />
                  </Stack>
                  <HoursSelector onSelectHourPackage={onSelectHourPackage} />
                </Stack>
              ) : (
                <Stack
                  sx={{
                    width: '100%',
                  }}
                >
                  <Typography>
                    {i18n._(
                      'Participate in Community activities like sharing posts in the Community Feed, discuss daily questions and play in the game. Top-5 most active users in the Community gets a Full Access until they in top-5',
                    )}
                  </Typography>
                </Stack>
              )}
            </Stack>

            <Stack gap="80px">
              <Stack
                sx={{
                  width: '100%',
                }}
              >
                <Typography
                  variant="h4"
                  component="h3"
                  sx={{ marginBottom: '10px', fontWeight: 800 }}
                >
                  {i18n._('What do you get with Full Access?')}
                </Typography>
                <FeatureList appMode={appMode} />
              </Stack>
              <Stack
                sx={{
                  gap: '100px',
                }}
              >
                <FaqSubscription />
                <PriceContact />
              </Stack>
            </Stack>
          </Stack>
        )}
        <Stack
          sx={{
            paddingTop: '30px',
            width: '100%',
            alignItems: 'flex-start',
          }}
        >
          <Button
            variant="outlined"
            endIcon={<X />}
            onClick={() => {
              if (isShowConfirmPayments) {
                openMainSubscriptionPage();
                return;
              }
              usage.togglePaymentModal(false);
            }}
          >
            {i18n._('Close')}
          </Button>
        </Stack>
      </Stack>
    </CustomModal>
  );
};
