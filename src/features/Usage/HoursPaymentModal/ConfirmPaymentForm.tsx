import { FeatureList } from '@/features/Landing/Price/FeatureList';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import { useSettings } from '@/features/Settings/useSettings';
import { useCurrency } from '@/features/User/useCurrency';
import { useLingui } from '@lingui/react';
import { Stack, FormControlLabel, Checkbox, Typography, Button, Link } from '@mui/material';
import { ChevronRight, CreditCard, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export const ConfirmPaymentForm = ({
  onConfirmRequest,
  amountInUsd,
  isRedirecting,
}: {
  onConfirmRequest: () => void;
  amountInUsd: number;
  isRedirecting: boolean;
}) => {
  const [looseRightChecked, setLooseRightChecked] = useState(false);
  const { i18n } = useLingui();
  const [isTermsChecked, setIsTermsChecked] = useState(false);
  const settings = useSettings();
  const pageLang = settings.userSettings?.pageLanguageCode || 'en';
  const [isMarketingChecked, setIsMarketingChecked] = useState(false);
  const currency = useCurrency();

  return (
    <Stack
      sx={{
        gap: '20px',
      }}
      component={'form'}
      action={'#'}
      onSubmit={(e) => {
        e.preventDefault();
        onConfirmRequest();
      }}
    >
      <Stack gap={'12px'}>
        <FormControlLabel
          required
          sx={{
            '.MuiFormControlLabel-asterisk': {
              color: '#f24',
            },
          }}
          checked={looseRightChecked}
          onChange={(e) => setLooseRightChecked(!looseRightChecked)}
          control={<Checkbox size="large" />}
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
          control={<Checkbox size="large" />}
          label={
            <Typography variant="caption">
              {i18n._(`I accept the`)}{' '}
              <Link target="_blank" href={`${getUrlStart(pageLang)}terms`}>
                {i18n._(`Terms and Conditions`)}
              </Link>{' '}
              {i18n._(`of the Website operated by Fundacja Rozwoju Przedsiębiorczości "Twój
                                  StartUp" with its registered office in Warsaw.`)}
            </Typography>
          }
        />
      </Stack>

      <Stack
        sx={{
          gap: '5px',
          width: '100%',
          alignItems: 'flex-start',
        }}
      >
        <Button
          color="info"
          variant="contained"
          disabled={isRedirecting}
          size="large"
          type="submit"
          endIcon={<ChevronRight />}
          name="submit"
          sx={{
            padding: '12px 60px',
            fontSize: '18px',
            fontWeight: 600,
            textAlign: 'left',
            marginTop: '20px',
            '@media (max-width: 500px)': {
              padding: '12px 30px',
            },
          }}
        >
          {i18n._(`Pay {amount}`, {
            amount: currency.convertUsdToCurrency(amountInUsd),
          })}
        </Button>
        <Stack
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: '5px',
            paddingTop: '2px',
          }}
        >
          <ShieldCheck size={'16px'} />
          <Typography variant="body2">
            Secure checkout powered by <b>Stripe</b>
          </Typography>
        </Stack>
      </Stack>
      <Stack
        sx={{
          paddingTop: '20px',
        }}
      >
        <FeatureList />
      </Stack>
    </Stack>
  );
};
