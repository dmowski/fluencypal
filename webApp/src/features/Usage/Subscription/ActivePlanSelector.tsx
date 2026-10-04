import { useLingui } from '@lingui/react';
import { Button, ButtonGroup, Stack, Typography } from '@mui/material';
import { ChevronRight } from 'lucide-react';
import {
  PaidAccessPeriod,
  PaidAccessPlanId,
  PAID_ACCESS_PLANS,
} from '@/features/Price/paidAccessPlans';
import { useCurrency } from '@/features/User/useCurrency';
import { formatPaidAccessHours } from './paidAccessCopy';

const PLAN_ORDER: PaidAccessPlanId[] = ['practice', 'conversation', 'conversation-10'];

export const ActivePlanSelector = ({
  selectedDuration,
  setSelectedDuration,
  onSelectPlan,
}: {
  selectedDuration: PaidAccessPeriod;
  setSelectedDuration: (duration: PaidAccessPeriod) => void;
  onSelectPlan: (plan: PaidAccessPlanId) => void;
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

  return (
    <Stack
      data-testid="subscription-plan-selector"
      sx={{
        gap: '18px',
        width: '100%',
      }}
    >
      <ButtonGroup
        sx={{
          width: '100%',
          '& .MuiButton-root': {
            minWidth: 0,
            px: '6px',
          },
        }}
      >
        {(['week', 'month', 'year'] as const).map((duration) => (
          <Button
            key={duration}
            fullWidth
            color="info"
            data-testid={`subscription-duration-${duration}`}
            aria-pressed={selectedDuration === duration}
            onClick={() => setSelectedDuration(duration)}
            variant={selectedDuration === duration ? 'contained' : 'outlined'}
          >
            {durationLabels[duration]}
          </Button>
        ))}
      </ButtonGroup>

      <Stack sx={{ gap: '12px', width: '100%' }}>
        {PLAN_ORDER.map((planId) => {
          const plan = PAID_ACCESS_PLANS[planId];
          const hours = plan.advancedHours[selectedDuration];
          const features = [
            i18n._('Unlimited Just Talk'),
            i18n._('Unlimited Personal Plan'),
            i18n._('Unlimited Exams, RolePlay, and Daily Lessons'),
          ];
          if (hours > 0) {
            features.push(
              i18n._('Advanced conversation ({hours})', {
                hours: formatPaidAccessHours(hours, i18n),
              }),
            );
          }
          if (plan.includesCommunity) {
            features.push(i18n._('Group conversations'));
          }

          return (
            <Stack
              key={planId}
              data-testid={`paid-access-plan-${planId}`}
              sx={{
                gap: '10px',
                width: '100%',
                borderRadius: '18px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: '#212121',
                padding: '16px 16px 18px 16px',
              }}
            >
              <Stack
                direction="row"
                sx={{ alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}
              >
                <Typography sx={{ fontWeight: 700 }}>{planTitles[planId]}</Typography>
                <Typography sx={{ fontWeight: 700 }}>
                  {currency.convertPrice(plan.pricesUsd[selectedDuration])} {currency.currency}
                </Typography>
              </Stack>
              <Stack sx={{ gap: '4px' }}>
                {features.map((feature) => (
                  <Typography key={feature} variant="body2" sx={{ opacity: 0.85 }}>
                    {feature}
                  </Typography>
                ))}
              </Stack>
              <Button
                color="info"
                variant="contained"
                onClick={() => onSelectPlan(planId)}
                endIcon={<ChevronRight />}
              >
                {i18n._('Continue')}
              </Button>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
};
