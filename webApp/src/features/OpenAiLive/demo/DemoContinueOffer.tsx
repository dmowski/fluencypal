'use client';

import { Button, Link, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { ArrowRight } from 'lucide-react';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import { SupportedLanguage } from '@/features/Lang/lang';
import { useCurrency } from '@/features/User/useCurrency';
import { formatApproxLocalFromUsd, formatCompactUsd } from '../formatBalance';
import { creditUsdMicrosForHours, microsToUsd } from '../pricing';

const primaryButtonSx = {
  minHeight: 56,
  borderRadius: '16px',
  textTransform: 'none',
  fontSize: 16,
  fontWeight: 700,
  background: '#d5b7ff',
  color: '#21122f',
  boxShadow: '0 4px 24px rgba(173,115,245,.16), 2px 2px 16px rgba(0,0,0,0.3)',
  '&:hover': { background: '#e2ceff' },
  '&.Mui-disabled': { background: '#332a40', color: '#afa2be' },
} as const;

export const DemoContinueOffer = ({ pageLanguage }: { pageLanguage: SupportedLanguage }) => {
  const { i18n } = useLingui();
  const currency = useCurrency();
  const hourUsd = microsToUsd(creditUsdMicrosForHours(1));
  const price = formatCompactUsd(hourUsd);
  const localPrice = formatApproxLocalFromUsd(hourUsd, currency.currency, currency.rate);
  const practiceHref = `${getUrlStart(pageLanguage)}practice`;

  return (
    <Stack sx={{ gap: 1.5 }}>
      <Typography sx={{ fontSize: 20, opacity: 0.8 }}>
        {i18n._(
          'You used the free 3 minutes. The next hour with Marin is {price}. That is the same conversation, without the timer.',
          { price },
        )}
      </Typography>
      {localPrice ? (
        <Typography sx={{ fontSize: 14, color: '#b8abc7' }}>{localPrice}</Typography>
      ) : null}
      <Button
        variant="contained"
        size="large"
        href={practiceHref}
        data-testid="demo-continue"
        data-analytics="demo-continue"
        endIcon={<ArrowRight size={19} />}
        sx={primaryButtonSx}
      >
        {i18n._('Continue for {price}', { price })}
      </Button>
      <Link
        href={practiceHref}
        underline="none"
        data-testid="demo-open-practice"
        data-analytics="demo-open-practice"
        sx={{ color: '#e2ceff', fontSize: 15, textAlign: 'center' }}
      >
        {i18n._('Open my practice dashboard')}
      </Link>
    </Stack>
  );
};
