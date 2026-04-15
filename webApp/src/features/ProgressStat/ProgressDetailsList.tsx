'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useState } from 'react';
import type { ProgressStat } from './types';
import { ProgressStatCard } from './ProgressStatCard';

const PAGE_SIZE = 10;

export const ProgressDetailsList = ({ stats }: { stats: ProgressStat[] }) => {
  const { i18n } = useLingui();
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const sorted = [...stats].sort((a, b) => b.createdAtIso.localeCompare(a.createdAtIso));
  const visible = sorted.slice(0, visibleCount);
  const hasMore = visibleCount < sorted.length;

  return (
    <Stack sx={{ gap: '56px', paddingTop: '80px' }}>
      <Stack sx={{ gap: '4px' }}>
        <Typography variant="h3" sx={{ fontWeight: 900 }}>
          {i18n._('Analysis points')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {sorted.length} {i18n._('records — newest first')}
        </Typography>
      </Stack>

      {sorted.length === 0 ? (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {i18n._('No analysis data yet.')}
        </Typography>
      ) : (
        <Stack sx={{ gap: '12px' }}>
          {visible.map((stat) => (
            <ProgressStatCard key={`${stat.sourceId}-${stat.algorithmVersion}`} stat={stat} />
          ))}
          {hasMore && (
            <Button
              variant="outlined"
              onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
              sx={{ alignSelf: 'center' }}
            >
              {i18n._('Show more')}
            </Button>
          )}
        </Stack>
      )}
    </Stack>
  );
};
