'use client';

import { Stack } from '@mui/material';
import { CustomModal } from '../../uiKit/Modal/CustomModal';
import { useUsage } from '../useUsage';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../Auth/useAuth';
import { useLingui } from '@lingui/react';
import { useSettings } from '../../Settings/useSettings';
import { sendAnalyticsEvent } from '@/features/Analytics/Custom/sendAnalyticsEvent';
import { PaymentSuccess } from '../HoursPaymentModal/PaymentSuccess';
import { SubscriptionDuration } from './types';
import {
  PAID_ACCESS_PLANS,
  PaidAccessPeriod,
  PaidAccessPlanId,
  paidAccessPriceUsd,
} from '@/features/Price/paidAccessPlans';
import { formatPaidAccessHours } from './paidAccessCopy';
import { BalanceStatus } from './BalanceStatus';
import { usePrices } from './usePrices';
import { ContactList } from '@/features/Landing/Contact/ContactList';
import { PaymentAuthGate } from './PaymentAuthGate';
import { DayPassConfirm } from './DayPassConfirm';
import { useUrlState } from '@/features/Url/useUrlState';
import { useAccess } from '../useAccess';
import { PaidAccessChooser } from './PaidAccessChooser';
import { PaidAccessReview } from './PaidAccessReview';
import { ConfirmPayment } from './ConfirmPayment';
import { usePaidAccessCheckout } from './usePaidAccessCheckout';
import dayjs from 'dayjs';

export const SubscriptionPaymentModal = () => {
  const usage = useUsage();
  const auth = useAuth();
  const access = useAccess();
  const { i18n } = useLingui();
  const settings = useSettings();
  const router = useRouter();
  const price = usePrices();
  const checkout = usePaidAccessCheckout();
  const [isReviewing, setIsReviewing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PaidAccessPlanId>('practice');
  const containerRef = useRef<HTMLDivElement | null>(null);

  const supportedLang = settings.pageLanguageCode || 'en';

  useEffect(() => {
    if (!auth.isIdentified) {
      return;
    }
    sendAnalyticsEvent({ name: 'paywall_view' });
  }, [auth.isIdentified]);

  const scrollTop = () => {
    containerRef.current?.parentElement?.parentElement?.parentElement?.scrollTo(0, 0);
  };

  const [subscriptionDuration, setSubscriptionDuration] = useUrlState<SubscriptionDuration>(
    'paymentDuration',
    'month',
    false,
  );
  const [paymentConfirm] = useUrlState('paymentConfirm', false, false);
  const [planLessonTitle] = useUrlState('planLesson', '', false);
  const [planLessonDetails] = useUrlState('planLessonDetails', '', false);
  const isDirectDayPass = Boolean(paymentConfirm);
  const pendingLesson =
    isDirectDayPass && planLessonTitle
      ? { title: planLessonTitle, details: planLessonDetails }
      : null;

  const planDuration: PaidAccessPeriod =
    subscriptionDuration === 'week' || subscriptionDuration === 'year'
      ? subscriptionDuration
      : 'month';
  const pricedDuration: SubscriptionDuration = isDirectDayPass ? 'day' : planDuration;
  const confirmAmountUsd =
    pricedDuration === 'day'
      ? price.subscriptionPrices.day.usdPrice
      : paidAccessPriceUsd(selectedPlan, pricedDuration);

  const expiring = price.subscriptionPrices[pricedDuration].expiringDateIso;
  const expiringFormatted = dayjs(expiring).locale(supportedLang).format('D MMMM');
  const durationLabels: Record<SubscriptionDuration, string> = {
    day: i18n._('1 day'),
    week: i18n._('1 week'),
    month: i18n._('1 month'),
    year: i18n._('1 year'),
  };
  const offerHours =
    pricedDuration === 'day' ? 0 : PAID_ACCESS_PLANS[selectedPlan].advancedHours[pricedDuration];
  const confirmationSubTitle =
    i18n._(`Paid access until {tillDate}`, { tillDate: expiringFormatted }) +
    '. (' +
    durationLabels[pricedDuration] +
    ')' +
    (offerHours > 0
      ? `. ${i18n._('Advanced conversation ({hours})', {
          hours: formatPaidAccessHours(offerHours, i18n),
        })}`
      : '');

  const openChooser = () => {
    setIsReviewing(false);
    scrollTop();
  };

  const closePaymentModal = () => {
    setIsReviewing(false);
    if (!isDirectDayPass) {
      usage.togglePaymentModal(false);
      return;
    }
    const params = new URLSearchParams(window.location.search);
    params.delete('paymentModal');
    params.delete('paymentConfirm');
    params.delete('planLesson');
    params.delete('planLessonDetails');
    if (params.get('paymentDuration') === 'day') {
      params.delete('paymentDuration');
    }
    const search = params.toString();
    router.push(`${window.location.pathname}${search ? `?${search}` : ''}`, { scroll: false });
  };

  if (!usage.isShowPaymentModal) return null;

  if (usage.isSuccessPayment) {
    return (
      <CustomModal isOpen={true} onClose={() => usage.togglePaymentModal(false)} zIndex={1400}>
        <PaymentSuccess onClose={() => usage.togglePaymentModal(false)} />
      </CustomModal>
    );
  }

  return (
    <CustomModal
      isOpen={true && auth.isAuthorized}
      zIndex={1400}
      data-testid="subscription-payment-modal"
      onClose={() => {
        if (isDirectDayPass) {
          closePaymentModal();
          return;
        }
        if (isReviewing) {
          openChooser();
          return;
        }
        usage.togglePaymentModal(false);
      }}
    >
      {pendingLesson ? (
        <DayPassConfirm
          lesson={pendingLesson}
          accessLine={confirmationSubTitle}
          amountInUsd={confirmAmountUsd}
          isIdentified={Boolean(auth.isIdentified)}
          isAuthLoading={Boolean(auth.loading)}
          isRedirecting={checkout.isRedirecting}
          onConfirm={() => {
            void checkout.confirmDayPass();
          }}
        />
      ) : (
        <PaymentAuthGate>
          <Stack
            ref={containerRef}
            sx={{
              width: '100%',
              maxWidth: '520px',
              paddingTop: '12px',
              alignItems: 'stretch',
            }}
          >
            {isDirectDayPass ? (
              <ConfirmPayment
                amountInUsd={confirmAmountUsd}
                subTitle={confirmationSubTitle}
                clickOnConfirmRequest={() => {
                  void checkout.confirmDayPass();
                }}
                isRedirecting={checkout.isRedirecting}
              />
            ) : access.isFullAppAccess ? (
              <Stack sx={{ gap: '28px', width: '100%', paddingBottom: '24px' }}>
                <BalanceStatus />
                <ContactList />
              </Stack>
            ) : isReviewing ? (
              <PaidAccessReview
                planId={selectedPlan}
                duration={planDuration}
                amountInUsd={confirmAmountUsd}
                isRedirecting={checkout.isRedirecting}
                onBack={openChooser}
                onConfirm={() => {
                  void checkout.confirmPaidAccess(selectedPlan, planDuration);
                }}
              />
            ) : (
              <PaidAccessChooser
                selectedDuration={planDuration}
                setSelectedDuration={setSubscriptionDuration}
                selectedPlan={selectedPlan}
                setSelectedPlan={setSelectedPlan}
                onContinue={() => {
                  setIsReviewing(true);
                  scrollTop();
                }}
              />
            )}
          </Stack>
        </PaymentAuthGate>
      )}
    </CustomModal>
  );
};
