import { getUrlStart } from '@/features/Lang/getUrlStart';
import { useSettings } from '@/features/Settings/useSettings';
import { useCurrency } from '@/features/User/useCurrency';
import { useLingui } from '@lingui/react';
import { Stack, FormControlLabel, Checkbox, Typography, Button } from '@mui/material';
import { Link } from 'lucide-react';
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
              <Link target="_blank" href={`${getUrlStart(pageLang)}terms`}>
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
          width: '100%',
        }}
      >
        <Stack
          sx={{
            padding: '6px 0',
          }}
        >
          <Typography variant="h5">
            {i18n._(`Total:`)} <b>{currency.convertUsdToCurrency(amountInUsd)}</b>
          </Typography>
        </Stack>
      </Stack>
      <Stack
        sx={{
          alignItems: 'center',
          justifyContent: 'center',
          gap: '5px',
        }}
      >
        <Button
          color="info"
          fullWidth
          variant="contained"
          disabled={isRedirecting}
          size="large"
          type="submit"
          name="submit"
        >
          {i18n._(`Pay`)}
        </Button>
      </Stack>
    </Stack>
  );
};
