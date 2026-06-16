import { getUrlStart } from '@/features/Lang/getUrlStart';
import { useSettings } from '@/features/Settings/useSettings';
import { useCurrency } from '@/features/User/useCurrency';
import { useLingui } from '@lingui/react';
import { Stack, FormControlLabel, Checkbox, Typography, Button, Link } from '@mui/material';
import { ChevronRight, ShieldCheck } from 'lucide-react';
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
  const currency = useCurrency();
  const canSubmit = looseRightChecked && isTermsChecked && !isRedirecting;

  return (
    <Stack
      sx={{
        gap: '20px',
      }}
      component={'form'}
      action={'#'}
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSubmit) {
          return;
        }
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
          onChange={() => setLooseRightChecked(!looseRightChecked)}
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
          onChange={() => setIsTermsChecked(!isTermsChecked)}
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
        <Typography variant="caption" sx={{ opacity: 0.85 }}>
          {i18n._(
            `You have the right to withdraw from the contract within 14 days. The withdrawal function is available at Profile → Payment History → "Withdraw from contract here".`,
          )}
        </Typography>
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
          disabled={!canSubmit}
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
          {i18n._(`Order with obligation to pay {amount}`, {
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
    </Stack>
  );
};
