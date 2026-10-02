'use client';

import { Stack, Typography } from '@mui/material';

export const OpenAiLiveBalanceText = ({
  usd,
  local,
  usdFontSize = '28px',
  localFontSize = '16px',
  testId,
}: {
  usd: string;
  local?: string;
  usdFontSize?: string;
  localFontSize?: string;
  testId?: string;
}) => (
  <Stack direction="row" sx={{ alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
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
        {local}
      </Typography>
    ) : null}
  </Stack>
);
