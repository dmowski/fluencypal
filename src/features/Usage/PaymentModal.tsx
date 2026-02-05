import {
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { useUsage } from './useUsage';
import { useNotifications } from '@toolpad/core/useNotifications';
import AddCardIcon from '@mui/icons-material/AddCard';
import { useState } from 'react';
import { useAuth } from '../Auth/useAuth';
import { sendTelegramRequest } from '../Telegram/sendTextAiRequest';
import dayjs from 'dayjs';
import { PaymentLogType } from '@/common/usage';
import AssuredWorkloadIcon from '@mui/icons-material/AssuredWorkload';
import { createStripeCheckout } from './createStripeCheckout';
import { CircleCheck, Headset, Users } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { supportedLanguages } from '@/features/Lang/lang';
import { useLingui } from '@lingui/react';
import { getUrlStart } from '../Lang/getUrlStart';
import { useCurrency } from '../User/useCurrency';
import { convertHoursToHumanFormat, detailedHours } from '@/libs/convertHoursToHumanFormat';
import { pricePerHourUsd } from '@/common/ai';
import { TRIAL_DAYS } from '@/common/subscription';
import { sleep } from '@/libs/sleep';
import { FaqItem } from '../Landing/FAQ/FaqItem';
import { useSettings } from '../Settings/useSettings';
import { FaqHours } from './HoursPaymentModal/FaqHours';
import { BalanceHeader } from './HoursPaymentModal/BalanceHeader';
import { PriceContact } from './HoursPaymentModal/PriceContact';
import { HourCard } from './HoursPaymentModal/HourCard';
import { BalanceContent } from './HoursPaymentModal/BalanceContent';
import { FeatureList } from '../Landing/Price/FeatureList';
import { Avatar } from '../Game/Avatar';
import { useGame } from '../Game/useGame';
import { ConfirmPaymentForm } from './HoursPaymentModal/ConfirmPaymentForm';
import { useUrlState } from '../Url/useUrlState';
import { FounderMessage } from './HoursPaymentModal/FounderMessage';

export const PaymentModal = () => {
  const usage = useUsage();
  const auth = useAuth();
  const { i18n } = useLingui();
  const currency = useCurrency();
  const devEmails = ['dmowski.alex@gmail.com'];
  const notifications = useNotifications();
  const [looseRightChecked, setLooseRightChecked] = useState(false);
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const [isMarketingChecked, setIsMarketingChecked] = useState(false);
  const [amountToAdd, setAmountToAdd] = useState(1);
  const [isShowAmountInput, setIsShowAmountInput] = useState(false);

  const pathname = usePathname();
  const settings = useSettings();
  const appMode = settings.appMode;
  const locale = pathname?.split('/')[1] as string;
  const supportedLang = supportedLanguages.find((l) => l === locale) || 'en';

  const sentTgMessage = async (message: string) => {
    const isDevEmail = devEmails.includes(auth?.userInfo?.email || '');
    if (isDevEmail) {
      return;
    }

    sendTelegramRequest(
      {
        message: message,
      },
      await auth.getToken(),
    );
  };
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

  const onShowAmountInput = () => {
    setIsShowAmountInput(true);
  };

  const [isShowInitBalanceModal, setIsShowInitBalanceModal] = useState(true);
  const [isShowPaymentModal, setIsShowPaymentModal] = useState(false);

  const onSelectHourPackage = async (hours: number) => {
    setAmountToAdd(hours);
    await sleep(50);
    setIsShowPaymentModal(true);
  };

  const game = useGame();
  const founderUserId = 'Mq2HfU3KrXTjNyOpPXqHSPg5izV2';
  const founderAvatar = game.gameAvatars[founderUserId] || '';

  const [isPaymentSuccess, setPaymentSuccess] = useUrlState('paymentSuccess', '', false);

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

  if (isShowInitBalanceModal) {
    return (
      <CustomModal
        isOpen={true && auth.isAuthorized}
        onClose={() => usage.togglePaymentModal(false)}
      >
        <BalanceContent onSelectHourPackage={onSelectHourPackage} />
      </CustomModal>
    );
  }

  return (
    <CustomModal isOpen={true && auth.isAuthorized} onClose={() => usage.togglePaymentModal(false)}>
      {isShowAmountInput ? (
        <>
          <Stack
            sx={{
              width: '100%',
              gap: '30px',
              alignItems: 'flex-start',
            }}
            component={'form'}
            action={'#'}
            onSubmit={(e) => {
              console.log('e', e);
              e.preventDefault();
              clickOnConfirmRequest();
            }}
          >
            <Stack>
              <Typography variant="h4" component="h2">
                {i18n._(`Buy more hours`)}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  opacity: 0.7,
                }}
              >
                {i18n._(`Let's add some hours to your balance`)}
              </Typography>
            </Stack>

            <Stack
              sx={{
                width: '100%',
                gap: '20px',
                flexDirection: 'row',
                '@media (max-width: 600px)': {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                },
              }}
            >
              <Stack
                sx={{
                  flexDirection: 'column',
                  gap: '5px',
                }}
              >
                <TextField
                  label={i18n._(`Amount hours to buy`)}
                  value={amountToAdd ? amountToAdd : ''}
                  type="text"
                  onChange={(e) => {
                    if (!e.target.value) {
                      setAmountToAdd(0);
                      return;
                    }
                    const number = parseFloat(e.target.value);
                    if (isNaN(number)) {
                      return;
                    }
                    setAmountToAdd(Math.abs(number) || 0);
                  }}
                />
                <Stack
                  sx={{
                    flexDirection: 'row',
                    gap: '10px',
                  }}
                >
                  {[1, 2, 5].map((amount) => (
                    <Button
                      key={amount}
                      onClick={() => setAmountToAdd(amount)}
                      variant={amount == amountToAdd ? 'contained' : 'outlined'}
                    >
                      {amount}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            </Stack>

            <Stack
              sx={{
                width: '100%',
              }}
            >
              <Divider />
              <Stack
                sx={{
                  padding: '6px 0',
                }}
              >
                <Typography
                  sx={{
                    opacity: 0.9,
                  }}
                >
                  {i18n._(`Price per one AI hour:`)}{' '}
                  <b>{currency.convertUsdToCurrency(pricePerHourUsd)}</b>
                </Typography>

                <Typography variant="h5">
                  {i18n._(`Total:`)}{' '}
                  <b>{currency.convertUsdToCurrency(amountToAdd * pricePerHourUsd)}</b>
                </Typography>
              </Stack>
              <Divider />
            </Stack>

            <Stack>
              <Stack gap={'10px'}>
                <Stack gap={'2px'}>
                  <FormControlLabel
                    required
                    sx={{
                      '.MuiFormControlLabel-asterisk': {
                        color: '#f24',
                      },
                    }}
                    checked={looseRightChecked}
                    onChange={(e) => setLooseRightChecked(!looseRightChecked)}
                    control={<Checkbox />}
                    label={
                      <Typography variant="caption">
                        {i18n._(`I want the service to be provided immediately and I acknowledge that as soon
                        as the Fundacja Rozwoju Przedsiębiorczości "Twój StartUp" provides the
                        service, I will lose the right to terminate the contract.`)}
                      </Typography>
                    }
                  />
                  <FormControlLabel
                    required
                    sx={{
                      '.MuiFormControlLabel-asterisk': {
                        color: '#f24',
                      },
                    }}
                    checked={isTermsChecked}
                    onChange={(e) => setIsTermsChecked(!isTermsChecked)}
                    control={<Checkbox />}
                    label={
                      <Typography variant="caption">
                        {i18n._(`I accept the`)}{' '}
                        <Link target="_blank" href={`${getUrlStart(supportedLang)}terms`}>
                          {i18n._(`Terms and Conditions`)}
                        </Link>{' '}
                        {i18n._(`of the Website operated by Fundacja Rozwoju Przedsiębiorczości "Twój
                        StartUp" with its registered office in Warsaw.`)}
                      </Typography>
                    }
                  />

                  <FormControlLabel
                    sx={{
                      '.MuiFormControlLabel-asterisk': {
                        color: '#f24',
                      },
                    }}
                    checked={isMarketingChecked}
                    onChange={(e) => setIsMarketingChecked(!isMarketingChecked)}
                    control={<Checkbox />}
                    label={
                      <Typography variant="caption">
                        {i18n._(`I want to receive commercial and marketing content`)}
                      </Typography>
                    }
                  />
                </Stack>

                <Stack
                  sx={{
                    flexDirection: 'row',
                    gap: '10px',
                  }}
                >
                  <Button
                    startIcon={<AssuredWorkloadIcon />}
                    size="large"
                    color="info"
                    type="submit"
                    sx={{
                      padding: '10px 25px',
                    }}
                    disabled={amountToAdd <= 0 || amountToAdd > 400}
                    variant="contained"
                  >
                    {i18n._(`Continue to payment`)} |{' '}
                    {currency.convertUsdToCurrency(amountToAdd * pricePerHourUsd)}
                  </Button>
                  <Button
                    onClick={() => {
                      setIsShowAmountInput(false);
                    }}
                  >
                    {i18n._(`Cancel`)}
                  </Button>
                </Stack>
                <Typography
                  variant="caption"
                  sx={{
                    opacity: 0.7,
                  }}
                >
                  {i18n._(`The Controller of the data entered into the form is Fundacja Rozwoju
                  Przedsiębiorczości "Twój StartUp". The data will be processed in order to provide
                  the service and for marketing purposes – in the case of consent. We would like to
                  inform you about the possibility of withdrawing your consent. For full information
                  on data processing and your rights, see the`)}{' '}
                  <Link target="_blank" href={`${getUrlStart(supportedLang)}privacy`}>
                    {i18n._(`privacy policy`)}
                  </Link>
                  .
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </>
      ) : (
        <>
          <Stack
            sx={{
              width: '100%',
              gap: '20px',
              alignItems: 'flex-start',
            }}
          >
            <Stack
              sx={{
                width: '100%',
                gap: '30px',
                alignItems: 'flex-start',
              }}
            >
              <Stack>
                {usage.isSuccessPayment ? (
                  <>
                    <Stack
                      sx={{
                        flexDirection: 'row',
                        gap: '10px',
                        color: '#2ecc71',
                        alignItems: 'center',
                      }}
                    >
                      <Typography variant="h4" component="h2">
                        {i18n._(`Success!`)}
                      </Typography>
                      <CircleCheck size={'1.6rem'} />
                    </Stack>
                    <Typography
                      variant="caption"
                      sx={{
                        opacity: 0.7,
                      }}
                    >
                      {i18n._(`Your payment was successful, but updates might take a few minutes`)}
                    </Typography>
                  </>
                ) : (
                  <>
                    <BalanceHeader />
                  </>
                )}
              </Stack>

              <Stack
                sx={{
                  gap: '20px',
                  width: '100%',
                  alignItems: 'flex-start',
                }}
              >
                <Stack
                  sx={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Stack>
                    <Typography variant="h3">
                      {convertHoursToHumanFormat(Math.max(0, usage.balanceHours))}
                    </Typography>
                    <Typography variant="caption">
                      {i18n._(`Current Balance of AI usage`)}
                    </Typography>
                  </Stack>
                </Stack>

                <Button
                  onClick={onShowAmountInput}
                  startIcon={<AddCardIcon />}
                  size="large"
                  variant="contained"
                >
                  {i18n._(`Buy More`)}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </>
      )}
    </CustomModal>
  );
};
