'use client';
import { Box, Button, ButtonGroup, Link, Stack, Typography } from '@mui/material';
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
import { AccessStatusIcon } from './AccessStatusIcon';
import { DynamicIcon, IconName } from 'lucide-react/dynamic';
import { CONTACTS } from '@/features/Landing/Contact/data';
import { FeatureItem } from './FeatureItem';

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
          maxWidth: '700px',
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
            <Stack
              sx={{
                gap: '20px',
              }}
            >
              <BalanceStatus />
              <Stack
                sx={{
                  gap: '20px',
                  width: '100%',
                }}
              >
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
                      width: '100%',
                    }}
                  >
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
            </Stack>

            {/*<ResultsSection />
            <FeatureSection />*/}
            <FaqSubscription />
            <PriceContact />
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

export const ResultsSection = () => {
  const { i18n } = useLingui();

  return (
    <Stack sx={{ width: '100%', gap: '12px' }}>
      <Typography variant="h4" component="h3" sx={{ marginBottom: '10px', fontWeight: 800 }}>
        {i18n._('Results')}
      </Typography>

      <Stack
        sx={{
          position: 'relative',
          borderRadius: '16px',
          maxWidth: '700px',
          border: '1px solid rgba(255,255,255,0.12)',
          background:
            'linear-gradient(180deg, rgba(15, 76, 147, 0.03) 0%, rgba(14, 55, 78, 0.17) 100%)',
        }}
      >
        <Stack sx={{ gap: '30px', padding: '25px 25px' }}>
          <FeatureItem
            iconName="calendar-days"
            title={i18n._('Practice daily')}
            subTitle={i18n._('Give it a few weeks. That’s when real confidence builds.')}
            startColor="#3B82F6"
            endColor="#06B6D4"
          />

          <FeatureItem
            iconName="shield-check"
            title={i18n._('Not feeling real progress?')}
            subTitle={i18n._('I’ll return your money — no questions.')}
            startColor="#22C55E"
            endColor="#84CC16"
          />
        </Stack>

        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
            padding: '20px 25px',
            backgroundColor: 'rgba(255,255,255,0.05)',
            borderTop: '1px solid rgba(255,255,255,0.09)',
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', gap: '8px' }}>
            <Typography sx={{ opacity: 0.85 }}>
              Alex Dmowski
              <Box component="span" sx={{ opacity: 0.7 }}>
                {' '}
                · {i18n._('Founder')}
              </Box>
            </Typography>
          </Stack>

          <Stack direction="row" sx={{ alignItems: 'center', gap: '8px' }}>
            <DynamicIcon name="mail" size={16} color="rgba(255,255,255,0.75)" />
            <Link
              href={`mailto:${CONTACTS.email}`}
              underline="hover"
              sx={{ color: 'rgba(255,255,255,0.85)' }}
            >
              {CONTACTS.email}
            </Link>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export const FeatureSection = () => {
  const { i18n } = useLingui();

  return (
    <Stack
      sx={{
        width: '100%',
        gap: '20px',
      }}
    >
      <Typography variant="h4" component="h3" sx={{ marginBottom: '10px', fontWeight: 800 }}>
        {i18n._("What's included?")}
      </Typography>

      <Stack sx={{ gap: '40px' }}>
        <FeatureItem
          iconName="star"
          title={i18n._('Unlimited AI speaking practice')}
          subTitle={i18n._(
            'Talk as much as you want — role-plays, assistants, and real conversations.',
          )}
          startColor="#8B5CF6"
          endColor="#EC4899"
        />

        <FeatureItem
          iconName="target"
          title={i18n._('Personal learning plan')}
          subTitle={i18n._('Get a clear path based on your level, goals, and progress.')}
          startColor="#22C55E"
          endColor="#84CC16"
        />

        <FeatureItem
          iconName="message-circle"
          title={i18n._('Feedback that helps')}
          subTitle={i18n._('Instant corrections and better phrasing so you improve faster.')}
          startColor="#06B6D4"
          endColor="#3B82F6"
        />

        <FeatureItem
          iconName="users"
          title={i18n._('Community access')}
          subTitle={i18n._('Ask questions, share progress, and find speaking partners.')}
          startColor="#F97316"
          endColor="#FACC15"
        />

        <FeatureItem
          iconName="shield"
          title={i18n._('No auto-renew. You stay in control')}
          subTitle={i18n._('Pay once for a day, week, or month — extend only if you want.')}
          startColor="#64748B"
          endColor="#94A3B8"
        />

        <FeatureItem
          iconName="users"
          title={i18n._('Community access')}
          subTitle={i18n._('Ask questions, share progress, and find speaking partners.')}
          startColor="#44b9ef"
          endColor="#71a4fb"
        />

        <FeatureItem
          iconName="life-buoy"
          title={i18n._('Priority support')}
          subTitle={i18n._('Get help faster if something breaks or you have questions.')}
          startColor="#EF4444"
          endColor="#FB7185"
        />
      </Stack>
    </Stack>
  );
};
