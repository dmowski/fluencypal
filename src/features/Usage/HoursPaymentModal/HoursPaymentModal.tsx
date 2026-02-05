import { Stack, Typography } from '@mui/material';
import { CustomModal } from '../../uiKit/Modal/CustomModal';
import { useUsage } from '../useUsage';
import { useNotifications } from '@toolpad/core/useNotifications';
import { useState } from 'react';
import { useAuth } from '../../Auth/useAuth';
import { createStripeCheckout } from '../createStripeCheckout';
import { usePathname } from 'next/navigation';
import { supportedLanguages } from '@/features/Lang/lang';
import { useLingui } from '@lingui/react';
import { useCurrency } from '../../User/useCurrency';
import { pricePerHourUsd } from '@/common/ai';
import { sleep } from '@/libs/sleep';
import { BalanceContent } from './BalanceContent';
import { ConfirmPaymentForm } from './ConfirmPaymentForm';
import { useUrlState } from '../../Url/useUrlState';
import { FounderMessage } from './FounderMessage';
import { PaymentSuccess } from './PaymentSuccess';

export const HoursPaymentModal = () => {
  const usage = useUsage();
  const auth = useAuth();
  const { i18n } = useLingui();
  const currency = useCurrency();
  const notifications = useNotifications();
  const [amountToAdd, setAmountToAdd] = useState(1);

  const pathname = usePathname();
  const locale = pathname?.split('/')[1] as string;
  const supportedLang = supportedLanguages.find((l) => l === locale) || 'en';

  const [isRedirecting, setIsRedirecting] = useState(false);

  const clickOnConfirmRequest = async () => {
    setIsRedirecting(true);
    const checkoutInfo = await createStripeCheckout(
      {
        userId: auth.uid,
        amountOfHours: amountToAdd,
        languageCode: supportedLang,
        currency: currency.currency,
      },
      await auth.getToken(),
    );

    if (!checkoutInfo.sessionUrl) {
      console.log('checkoutInfo', checkoutInfo);
      notifications.show('Error creating payment session', {
        severity: 'error',
      });
      setIsRedirecting(false);
      return;
    } else {
      window.location.href = checkoutInfo.sessionUrl;
    }
  };

  const [isShowPaymentModal, setIsShowPaymentModal] = useState(false);

  const onSelectHourPackage = async (hours: number) => {
    setAmountToAdd(hours);
    await sleep(50);
    setIsShowPaymentModal(true);
  };

  const [isPaymentSuccess, setPaymentSuccess] = useUrlState('paymentSuccess', '', false);
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

  if (isShowPaymentModal) {
    return (
      <CustomModal
        isOpen={true && auth.isAuthorized}
        onClose={() => usage.togglePaymentModal(false)}
      >
        <Stack
          sx={{
            width: '100%',
            maxWidth: '700px',
            gap: '40px',
          }}
        >
          <Stack
            sx={{
              maxWidth: '700px',
              width: '100%',
              boxSizing: 'border-box',
              gap: '40px',
              alignItems: 'center',
            }}
          >
            <Stack
              sx={{
                width: '100%',
              }}
            >
              <Typography
                sx={{
                  width: '100%',
                }}
                variant="h5"
                component="h2"
              >
                {i18n._(`Confirm payment`)}
              </Typography>

              <Typography
                sx={{
                  width: '100%',
                  opacity: 0.7,
                }}
              >
                {i18n._(`Buying {hours} hour(s) of AI usage`, { hours: amountToAdd })}
              </Typography>
            </Stack>

            <ConfirmPaymentForm
              isRedirecting={isRedirecting}
              amountInUsd={amountToAdd * pricePerHourUsd}
              onConfirmRequest={clickOnConfirmRequest}
            />
            <FounderMessage />
          </Stack>
        </Stack>
      </CustomModal>
    );
  }

  return (
    <CustomModal isOpen={true && auth.isAuthorized} onClose={() => usage.togglePaymentModal(false)}>
      <BalanceContent onSelectHourPackage={onSelectHourPackage} />
    </CustomModal>
  );
};
