'use client';

import { useState } from 'react';
import { Button, ButtonGroup, Stack, Typography } from '@mui/material';
import { GraduationCap, Mic, Sparkles, Speech } from 'lucide-react';
import { useLingui } from '@lingui/react';
import {
  PAID_ACCESS_PLANS,
  PaidAccessPeriod,
  PaidAccessPlanId,
} from '@/features/Price/paidAccessPlans';
import { PriceCard } from './PriceCard';
import { CurrencyToDisplay, PriceDisplay } from './PriceDisplay';

const PLAN_ORDER: PaidAccessPlanId[] = ['practice', 'conversation', 'conversation-10'];

const hourLabel = (
  hours: number,
  i18n: { _: (id: string, values?: Record<string, string | number>) => string },
) => {
  if (hours === 0.5) return i18n._('30 minutes');
  if (hours === 1) return i18n._('1 hour');
  return i18n._('{count} hours', { count: hours });
};

export const PaidAccessPriceSection = ({ quizLink }: { quizLink: string }) => {
  const { i18n } = useLingui();
  const [period, setPeriod] = useState<PaidAccessPeriod>('month');

  const periodLabels: Record<PaidAccessPeriod, string> = {
    week: i18n._('Week'),
    month: i18n._('Month'),
    year: i18n._('Year'),
  };
  const perLabels: Record<PaidAccessPeriod, string> = {
    week: i18n._('week'),
    month: i18n._('month'),
    year: i18n._('year'),
  };
  const titles: Record<PaidAccessPlanId, string> = {
    practice: i18n._('Practice'),
    conversation: i18n._('Conversation'),
    'conversation-10': i18n._('Conversation 10'),
  };
  const subtitles: Record<PaidAccessPlanId, string> = {
    practice: i18n._('Unlimited practice for the period you choose'),
    conversation: i18n._('Practice, plus a block of advanced conversation'),
    'conversation-10': i18n._('The larger advanced-conversation block'),
  };

  return (
    <Stack sx={{ width: '100%', gap: '28px', alignItems: 'center' }}>
      <ButtonGroup>
        {(['week', 'month', 'year'] as const).map((item) => (
          <Button
            key={item}
            data-testid={`price-period-${item}`}
            aria-pressed={period === item}
            variant={period === item ? 'contained' : 'outlined'}
            onClick={() => setPeriod(item)}
          >
            {periodLabels[item]}
          </Button>
        ))}
      </ButtonGroup>

      <Stack
        sx={{
          display: 'grid',
          width: '100%',
          gap: '30px',
          gridTemplateColumns: '1fr 1fr 1fr',
          '@media (max-width: 1000px)': {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '40px',
          },
        }}
      >
        {PLAN_ORDER.map((planId) => {
          const plan = PAID_ACCESS_PLANS[planId];
          const hours = plan.advancedHours[period];
          const practiceItems = [
            {
              title: i18n._('Unlimited Just Talk'),
              tooltip: i18n._('Talk with the teacher as much as you want during paid access'),
              icon: Mic,
            },
            {
              title: i18n._('Unlimited Personal Plan'),
              tooltip: i18n._('A plan that follows your level and goals'),
              icon: GraduationCap,
            },
            {
              title: i18n._('Unlimited Exams, RolePlay, and Daily Lessons'),
              tooltip: i18n._('Exams, role-play, and the daily lesson are included'),
              icon: Speech,
            },
          ];
          const listItems = [...practiceItems];
          if (hours > 0) {
            listItems.push({
              title: i18n._('Advanced conversation ({hours})', { hours: hourLabel(hours, i18n) }),
              tooltip: i18n._('Hours added to your advanced conversation balance'),
              icon: Sparkles,
            });
          }

          return (
            <PriceCard
              key={planId}
              title={titles[planId]}
              subTitle={subtitles[planId]}
              price={
                <Stack sx={{ flexDirection: 'row', alignItems: 'center', gap: '8px' }}>
                  <Typography
                    variant="h2"
                    component="span"
                    sx={{ fontWeight: 600, fontSize: '3rem' }}
                  >
                    <PriceDisplay amountInUsd={plan.pricesUsd[period]} />
                  </Typography>
                  <Stack>
                    <Typography variant="caption" sx={{ textTransform: 'uppercase' }}>
                      <CurrencyToDisplay />
                    </Typography>
                    <Typography variant="caption">/ {perLabels[period]}</Typography>
                  </Stack>
                </Stack>
              }
              priceSubDescription={i18n._('One payment. No automatic renewal.')}
              listTitle={i18n._("What's included")}
              listItems={listItems}
              buttonTitle={i18n._('Start')}
              buttonLink={quizLink}
              isLightButton
            />
          );
        })}
      </Stack>
    </Stack>
  );
};
