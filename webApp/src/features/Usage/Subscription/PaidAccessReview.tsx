'use client';

import { useLingui } from '@lingui/react';
import { Button, Stack, Typography } from '@mui/material';
import { ArrowLeft } from 'lucide-react';
import {
  PAID_ACCESS_PLANS,
  PaidAccessPeriod,
  PaidAccessPlanId,
} from '@/features/Price/paidAccessPlans';
import { useCurrency } from '@/features/User/useCurrency';
import { ConfirmPaymentForm } from '../HoursPaymentModal/ConfirmPaymentForm';
import { formatPaidAccessHours } from './paidAccessCopy';

export const PaidAccessReview = ({
  planId,
  duration,
  amountInUsd,
  isRedirecting,
  onBack,
  onConfirm,
}: {
  planId: PaidAccessPlanId;
  duration: PaidAccessPeriod;
  amountInUsd: number;
  isRedirecting: boolean;
  onBack: () => void;
  onConfirm: () => void;
}) => {
  const { i18n } = useLingui();
  const currency = useCurrency();
  const plan = PAID_ACCESS_PLANS[planId];
  const hours = plan.advancedHours[duration];

  const durationLabels: Record<PaidAccessPeriod, string> = {
    week: i18n._('1 week'),
    month: i18n._('1 month'),
    year: i18n._('1 year'),
  };
  const planTitles: Record<PaidAccessPlanId, string> = {
    practice: i18n._('Practice'),
    conversation: i18n._('Conversation'),
    'conversation-10': i18n._('Conversation 10'),
  };

  const rows = [
    { label: i18n._('Access period'), value: durationLabels[duration] },
    { label: i18n._('Core practice'), value: i18n._('Unlimited') },
    {
      label: i18n._('Advanced conversation'),
      value: hours > 0 ? formatPaidAccessHours(hours, i18n) : i18n._('Not included'),
    },
    {
      label: i18n._('Group conversations'),
      value: plan.includesCommunity ? i18n._('Included') : i18n._('Not included'),
    },
    {
      label: i18n._('One-time payment'),
      value: `${currency.convertPrice(amountInUsd)} ${currency.currency}`,
    },
  ];

  return (
    <Stack data-testid="paid-access-review" sx={{ gap: '18px', width: '100%' }}>
      <Button
        variant="text"
        onClick={onBack}
        startIcon={<ArrowLeft size={14} />}
        sx={{
          alignSelf: 'flex-start',
          px: 0,
          minWidth: 0,
          color: '#9fd8ef',
          fontSize: '12px',
        }}
      >
        {i18n._('Change plan')}
      </Button>
      <Stack sx={{ gap: '8px' }}>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 650, letterSpacing: '-0.4px' }}>
          {i18n._('Review your plan')}
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.68)', fontSize: '14px', lineHeight: 1.6 }}>
          {i18n._('Check your access and included conversation time.')}
        </Typography>
      </Stack>

      <Stack
        sx={{
          border: '1px solid rgba(255,255,255,0.16)',
          borderRadius: '12px',
          backgroundColor: '#212121',
          p: '20px',
        }}
      >
        <Typography sx={{ fontSize: '20px', fontWeight: 600, mb: '4px' }}>
          {planTitles[planId]}
        </Typography>
        <Stack component="dl" sx={{ m: 0 }}>
          {rows.map((row) => (
            <Stack
              key={row.label}
              component="div"
              direction="row"
              sx={{
                justifyContent: 'space-between',
                gap: '14px',
                py: '12px',
                borderTop: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <Typography component="dt" sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.62)' }}>
                {row.label}
              </Typography>
              <Typography component="dd" sx={{ m: 0, fontSize: '13px', textAlign: 'right' }}>
                {row.value}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Stack>

      <ConfirmPaymentForm
        amountInUsd={amountInUsd}
        isRedirecting={isRedirecting}
        onConfirmRequest={onConfirm}
      />
    </Stack>
  );
};
