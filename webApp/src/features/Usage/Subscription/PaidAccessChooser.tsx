'use client';

import { useLingui } from '@lingui/react';
import { Box, Button, Link, Radio, Stack, Typography } from '@mui/material';
import { Check, ChevronRight } from 'lucide-react';
import { CONTACTS } from '@/features/Landing/Contact/data';
import {
  PAID_ACCESS_PLANS,
  PaidAccessPeriod,
  PaidAccessPlanId,
} from '@/features/Price/paidAccessPlans';
import { useCurrency } from '@/features/User/useCurrency';
import { formatPaidAccessHours } from './paidAccessCopy';

const PLAN_ORDER: PaidAccessPlanId[] = ['practice', 'conversation', 'conversation-10'];

const sharedFeatures = (i18n: { _: (id: string) => string }) => [
  i18n._('Unlimited Just Talk'),
  i18n._('Unlimited Personal Plan'),
  i18n._('Unlimited exams, role-play, and daily lessons'),
  i18n._('Group conversations'),
];

export const PaidAccessChooser = ({
  selectedDuration,
  setSelectedDuration,
  selectedPlan,
  setSelectedPlan,
  onContinue,
}: {
  selectedDuration: PaidAccessPeriod;
  setSelectedDuration: (duration: PaidAccessPeriod) => void;
  selectedPlan: PaidAccessPlanId;
  setSelectedPlan: (plan: PaidAccessPlanId) => void;
  onContinue: () => void;
}) => {
  const { i18n } = useLingui();
  const currency = useCurrency();

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

  const selectedTitle = planTitles[selectedPlan];
  const selectedPrice = currency.convertPrice(
    PAID_ACCESS_PLANS[selectedPlan].pricesUsd[selectedDuration],
  );

  return (
    <Stack data-testid="subscription-plan-selector" sx={{ gap: '22px', width: '100%' }}>
      <Stack sx={{ gap: '8px' }}>
        <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
          {i18n._('Plans & access')}
        </Typography>
        <Typography variant="h4" component="h2" sx={{ fontWeight: 650, letterSpacing: '-0.4px' }}>
          {i18n._('Choose your plan')}
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.68)', fontSize: '14px', lineHeight: 1.6 }}>
          {i18n._('Unlimited practice, with extra advanced conversation time if you want it.')}
        </Typography>
      </Stack>

      <Stack sx={{ gap: '10px' }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.72)' }}>
          {i18n._('Access period')}
        </Typography>
        <Stack
          role="group"
          aria-label={i18n._('Access period')}
          direction="row"
          sx={{
            p: '4px',
            gap: '4px',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '10px',
            backgroundColor: 'rgba(0,0,0,0.28)',
          }}
        >
          {(['week', 'month', 'year'] as const).map((duration) => {
            const selected = selectedDuration === duration;
            return (
              <Button
                key={duration}
                fullWidth
                variant="text"
                data-testid={`subscription-duration-${duration}`}
                aria-pressed={selected}
                onClick={() => setSelectedDuration(duration)}
                sx={{
                  minHeight: 40,
                  borderRadius: '7px',
                  fontWeight: 500,
                  color: selected ? '#f4f8fb' : 'rgba(255,255,255,0.62)',
                  backgroundColor: selected ? 'rgba(255,255,255,0.14)' : 'transparent',
                  '&:hover': {
                    backgroundColor: selected ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
                  },
                }}
              >
                {durationLabels[duration]}
              </Button>
            );
          })}
        </Stack>
      </Stack>

      <Stack component="fieldset" sx={{ border: 0, p: 0, m: 0, gap: '10px', minWidth: 0 }}>
        <Typography
          component="legend"
          sx={{ fontSize: '12px', fontWeight: 500, color: 'rgba(255,255,255,0.72)' }}
        >
          {i18n._('Your plan')}
        </Typography>
        <Stack sx={{ gap: '10px' }}>
          {PLAN_ORDER.map((planId) => {
            const plan = PAID_ACCESS_PLANS[planId];
            const hours = plan.advancedHours[selectedDuration];
            const selected = selectedPlan === planId;
            const detail =
              hours > 0
                ? `${i18n._('Core practice')} + ${i18n._('Advanced conversation ({hours})', {
                    hours: formatPaidAccessHours(hours, i18n),
                  })}`
                : i18n._('All core practice modes');

            return (
              <Box
                key={planId}
                component="label"
                data-testid={`paid-access-plan-${planId}`}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '16px minmax(0,1fr) auto',
                  alignItems: 'center',
                  gap: '14px',
                  p: '18px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: selected ? '#8fd3ff' : 'rgba(255,255,255,0.16)',
                  backgroundColor: selected ? 'rgba(143, 211, 255, 0.08)' : '#212121',
                  boxShadow: selected ? 'inset 0 0 0 1px #8fd3ff' : 'none',
                  '@media (max-width: 480px)': {
                    p: '14px',
                    gap: '10px',
                  },
                }}
              >
                <Radio
                  checked={selected}
                  onChange={() => setSelectedPlan(planId)}
                  value={planId}
                  name="paid-access-plan"
                  size="small"
                  slotProps={{ input: { 'aria-label': planTitles[planId] } }}
                  sx={{
                    p: 0,
                    color: 'rgba(255,255,255,0.55)',
                    '&.Mui-checked': { color: '#8fd3ff' },
                  }}
                />
                <Stack sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 600, fontSize: '15px' }}>
                    {planTitles[planId]}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '12px',
                      lineHeight: 1.5,
                      color: 'rgba(255,255,255,0.62)',
                      mt: '4px',
                    }}
                  >
                    {detail}
                  </Typography>
                </Stack>
                <Stack sx={{ alignItems: 'flex-end' }}>
                  <Typography
                    sx={{
                      fontSize: '22px',
                      fontWeight: 600,
                      letterSpacing: '-0.4px',
                      lineHeight: 1.2,
                    }}
                  >
                    {currency.convertPrice(plan.pricesUsd[selectedDuration])}
                    <Box
                      component="span"
                      sx={{
                        ml: '4px',
                        fontSize: '11px',
                        fontWeight: 400,
                        color: 'rgba(255,255,255,0.62)',
                      }}
                    >
                      {currency.currency}
                    </Box>
                  </Typography>
                  <Typography sx={{ mt: '4px', fontSize: '11px', color: 'rgba(255,255,255,0.55)' }}>
                    {i18n._('for {period}', { period: durationLabels[selectedDuration] })}
                  </Typography>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      </Stack>

      <Stack component="section" sx={{ gap: '12px' }}>
        <Typography sx={{ fontSize: '12px', fontWeight: 550, color: 'rgba(255,255,255,0.78)' }}>
          {i18n._('Every plan includes')}
        </Typography>
        <Box
          component="ul"
          sx={{
            listStyle: 'none',
            p: 0,
            m: 0,
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px 20px',
            '@media (max-width: 480px)': {
              gridTemplateColumns: '1fr',
            },
          }}
        >
          {sharedFeatures(i18n).map((feature) => (
            <Box
              component="li"
              key={feature}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
                fontSize: '12px',
                lineHeight: 1.55,
                color: 'rgba(255,255,255,0.68)',
              }}
            >
              <Check size={14} style={{ marginTop: 3, flexShrink: 0 }} aria-hidden />
              {feature}
            </Box>
          ))}
        </Box>
      </Stack>

      <Stack sx={{ gap: '12px', borderTop: '1px solid rgba(255,255,255,0.1)', pt: '20px' }}>
        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}
        >
          <Typography sx={{ fontSize: '13px', color: 'rgba(255,255,255,0.68)' }}>
            {i18n._('{plan} · {period}', {
              plan: selectedTitle,
              period: durationLabels[selectedDuration],
            })}
          </Typography>
          <Typography sx={{ fontWeight: 600, fontSize: '16px' }}>
            {selectedPrice} {currency.currency}
          </Typography>
        </Stack>
        <Button
          color="info"
          variant="contained"
          fullWidth
          size="large"
          data-testid="paid-access-continue"
          onClick={onContinue}
          endIcon={<ChevronRight size={18} />}
          sx={{ minHeight: 48, fontWeight: 600 }}
        >
          {i18n._('Continue')}
        </Button>
        <Typography sx={{ textAlign: 'center', fontSize: '11px', color: 'rgba(255,255,255,0.5)' }}>
          {i18n._('One payment. No automatic renewal.')}
        </Typography>
      </Stack>

      <Typography sx={{ textAlign: 'center', fontSize: '12px', color: 'rgba(255,255,255,0.55)' }}>
        {i18n._('Need help choosing?')}{' '}
        <Link
          href={`mailto:${CONTACTS.email}`}
          underline="hover"
          sx={{ color: 'rgba(255,255,255,0.82)' }}
        >
          {i18n._('Contact Alex')}
        </Link>
      </Typography>
    </Stack>
  );
};
