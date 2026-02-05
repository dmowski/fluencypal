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

  const clickOnConfirmRequest = async () => {
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
      return;
    } else {
      window.location.href = checkoutInfo.sessionUrl;
    }
  };

  const onShowAmountInput = () => {
    setIsShowAmountInput(true);
  };

  if (!usage.isShowPaymentModal) return null;

  const balanceDetails = detailedHours(usage.balanceHours);

  const [isShowInitBalanceModal, setIsShowInitBalanceModal] = useState(true);
  const [isShowPaymentModal, setIsShowPaymentModal] = useState(false);

  const onSelectHourPackage = async (hours: number) => {
    setAmountToAdd(hours);
    await sleep(50);
    setIsShowPaymentModal(true);
  };

  if (isShowInitBalanceModal) {
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
          <BalanceHeader />

          <Stack
            sx={{
              gap: '10px',
            }}
          >
            <Typography variant="body2">{i18n._('Buy more hours. Why not?')}</Typography>
            <Stack
              sx={{
                width: '100%',
                gap: '20px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                '@media (max-width: 600px)': {
                  gridTemplateColumns: '1fr',
                  gap: '45px',
                },
              }}
            >
              <HourCard
                onClick={() => onSelectHourPackage(1)}
                label={i18n._('1 hour')}
                content={currency.convertUsdToCurrency(pricePerHourUsd)}
                buttonTitle={i18n._('Pay')}
                isRecommended={true}
                footnote={i18n._('Good for trying the service')}
              />

              <HourCard
                onClick={() => onSelectHourPackage(3)}
                label={i18n._('3 hours')}
                content={currency.convertUsdToCurrency(pricePerHourUsd * 3)}
                buttonTitle={i18n._('Pay')}
                footnote={i18n._('If you feel it')}
              />

              <HourCard
                onClick={() => onSelectHourPackage(5)}
                label={i18n._('5 hours')}
                content={currency.convertUsdToCurrency(pricePerHourUsd * 5)}
                buttonTitle={i18n._('Pay')}
                footnote={i18n._('My appreciation')}
              />
            </Stack>
          </Stack>

          <Stack
            sx={{
              paddingTop: '20px',
              gap: '35px',
            }}
          >
            <FaqHours />
            <PriceContact />
          </Stack>
        </Stack>
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
                {amountToAdd > 400 && (
                  <Typography variant="caption" color="error">
                    {i18n._(
                      `Amount is too large. I appreciate your support, but let's keep it under $400`,
                    )}
                  </Typography>
                )}

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

const BalanceHeader = () => {
  const usage = useUsage();
  const { i18n } = useLingui();
  const balanceDetails = detailedHours(usage.balanceHours);

  return (
    <Stack
      sx={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        gap: '20px',
      }}
    >
      <Typography variant="h4">{i18n._(`Balance`)}</Typography>

      <Stack
        sx={{
          borderRadius: '18px',
          backgroundColor: '#0e84c3',
          padding: '5px 15px',
        }}
      >
        <Typography
          variant="body1"
          sx={{
            fontWeight: 600,
          }}
        >
          {balanceDetails.hours} hours {balanceDetails.minutes} minutes
        </Typography>
      </Stack>
    </Stack>
  );
};

export const HourCard = ({
  onClick,
  label,
  content,
  buttonTitle,
  isRecommended,
  footnote,
}: {
  onClick: () => void;
  label: string;
  buttonTitle: string;
  content: string;
  isRecommended?: boolean;
  footnote: string;
}) => {
  return (
    <Stack
      sx={{
        width: '100%',
        backgroundColor: 'rgba(32, 137, 241, 0.1)',
        borderRadius: '7px',
      }}
    >
      <Stack
        sx={{
          backgroundColor: '#2089f1f7',
          borderRadius: '7px 7px 0 0',
          padding: '10px',
          alignItems: 'center',
          fontWeight: 600,
        }}
      >
        <Typography
          sx={{
            fontSize: '18px',
            fontWeight: 500,
            color: '#fff',
          }}
        >
          {label}
        </Typography>
      </Stack>

      <Stack
        sx={{
          alignItems: 'center',
          gap: '10px',
          padding: '40px 10px 30px 10px',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 600,
          }}
        >
          {content}
        </Typography>
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 20px',
            width: '100%',
          }}
        >
          <Button
            fullWidth
            color="info"
            variant={isRecommended ? 'contained' : 'outlined'}
            onClick={onClick}
            size="large"
            sx={{
              padding: '10px 0',
            }}
          >
            {buttonTitle}
          </Button>
        </Stack>

        <Typography
          sx={{
            //width: '100%',
            color: '#ffffff',
            textAlign: 'center',
            fontSize: '14px',
          }}
        >
          {footnote}
        </Typography>
      </Stack>
    </Stack>
  );
};

export const PriceContact = () => {
  const { i18n } = useLingui();
  const router = useRouter();
  const settings = useSettings();
  const language = settings.userSettings?.pageLanguageCode || 'en';

  const communityUrl = getUrlStart(language) + 'practice?page=community&section=chat';
  const supportUrl = getUrlStart(language) + 'practice?page=community&section=tech-support';

  return (
    <Stack
      sx={{
        gap: '5px',
        width: '100%',
        alignItems: 'flex-start',
      }}
    >
      <Typography variant="h6" component="h3" sx={{ marginBottom: '0px' }}>
        {i18n._('Not sure yet?')}
      </Typography>
      <Button
        variant="text"
        startIcon={<Users size={'14px'} />}
        onClick={() => router.push(communityUrl)}
      >
        {i18n._('Ask community')}
      </Button>
      <Button
        startIcon={<Headset size={'14px'} />}
        variant="text"
        onClick={() => router.push(supportUrl)}
      >
        {i18n._('Ask in support channel')}
      </Button>
    </Stack>
  );
};

export const FaqHours = () => {
  const { i18n } = useLingui();

  return (
    <Stack>
      <Typography variant="h6" component="h3" sx={{ marginBottom: '10px' }}>
        {i18n._('Frequently Asked Questions')}
      </Typography>
      <FaqItem
        info={{
          question: i18n._('Can I get full access for free?'),
          answer: i18n._(
            'Yes. Simply play on the Community page or send messages in the chat to earn points. The top five users will have full access as long as they remain at the top!',
          ),
        }}
      />

      <FaqItem
        info={{
          question: i18n._('Is this a subscription?'),
          answer: (
            <Stack
              sx={{
                gap: '10px',
              }}
            >
              <Typography>
                {i18n._(
                  'No, you are purchasing full access for a selected period of time. There is no auto-renewal, you can buy full access again when your current period ends.',
                )}
              </Typography>
            </Stack>
          ),
        }}
      />

      <FaqItem
        info={{
          question: i18n._('Can I do a refund after purchase?'),
          answer: i18n._(
            'Yes. If you\'re not satisfied with the service, on "Profile/Payment history" page you can request a refund and we will discuss the details.',
          ),
        }}
      />
    </Stack>
  );
};
