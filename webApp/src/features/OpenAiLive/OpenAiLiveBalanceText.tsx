'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { TalkTime } from './formatBalance';

export const OpenAiLiveBalanceText = ({
  usd,
  local,
  talkTime,
  usdFontSize = '28px',
  localFontSize = '16px',
  testId,
}: {
  usd: string;
  local?: string;
  talkTime?: TalkTime | null;
  usdFontSize?: string;
  localFontSize?: string;
  testId?: string;
}) => {
  const { i18n } = useLingui();
  const hoursLabel =
    talkTime?.hours === 1
      ? i18n._('{count} hour', { count: talkTime.hours })
      : i18n._('{count} hours', { count: talkTime?.hours ?? 0 });
  const minutesLabel =
    talkTime?.minutes === 1
      ? i18n._('{count} minute', { count: talkTime.minutes })
      : i18n._('{count} minutes', { count: talkTime?.minutes ?? 0 });
  const duration = !talkTime
    ? ''
    : talkTime.hours > 0 && talkTime.minutes > 0
      ? `${hoursLabel} ${minutesLabel}`
      : talkTime.hours > 0
        ? hoursLabel
        : minutesLabel;

  return (
    <Stack direction="row" sx={{ alignItems: 'baseline', gap: '18px', flexWrap: 'wrap' }}>
      <Typography
        component="span"
        data-testid={testId}
        sx={{ fontSize: usdFontSize, fontWeight: 700, color: '#fff', lineHeight: 1.1 }}
      >
        {usd}
      </Typography>
      {local ? (
        <Typography
          component="span"
          sx={{ fontSize: localFontSize, fontWeight: 500, opacity: 0.8, lineHeight: 1.1 }}
        >
          ~{local}
        </Typography>
      ) : null}
      {duration ? (
        <Typography
          component="span"
          data-testid={testId ? `${testId}-time` : undefined}
          sx={{ fontSize: localFontSize, fontWeight: 500, opacity: 0.8, lineHeight: 1.1 }}
        >
          ~{duration}
        </Typography>
      ) : null}
    </Stack>
  );
};
