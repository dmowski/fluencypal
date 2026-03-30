'use client';

import { useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ProgressChart } from '@/features/ProgressStat/ProgressChart';
import {
  mockProgressChartPoints,
  mockProgressWaveChartPoints,
} from '@/features/ProgressStat/mockData';
import { ProgressMetric } from '@/features/ProgressStat/types';

type DemoMode = 'steady' | 'wave' | 'empty';

export const ProgressStatTest = () => {
  const [mode, setMode] = useState<DemoMode>('steady');
  const [metric, setMetric] = useState<ProgressMetric>('grammar');

  const data = useMemo(() => {
    if (mode === 'wave') return mockProgressWaveChartPoints;
    if (mode === 'empty') return [];
    return mockProgressChartPoints;
  }, [mode]);

  return (
    <Stack
      sx={{
        width: '100%',
        maxWidth: '920px',
        margin: '0 auto',
        padding: '20px',
        gap: '16px',
      }}
    >
      <Typography variant="h6" sx={{ color: '#f0f4ff' }}>
        ProgressStat chart test
      </Typography>

      <Stack direction="row" sx={{ gap: '8px', flexWrap: 'wrap' }}>
        <Button
          variant={mode === 'steady' ? 'contained' : 'outlined'}
          onClick={() => setMode('steady')}
        >
          Steady data
        </Button>
        <Button
          variant={mode === 'wave' ? 'contained' : 'outlined'}
          onClick={() => setMode('wave')}
        >
          Volatile data
        </Button>
        <Button
          variant={mode === 'empty' ? 'contained' : 'outlined'}
          onClick={() => setMode('empty')}
        >
          Empty data
        </Button>
      </Stack>

      <Stack direction="row" sx={{ gap: '8px', flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant={metric === 'grammar' ? 'contained' : 'outlined'}
          onClick={() => setMetric('grammar')}
        >
          Grammar
        </Button>
        <Button
          size="small"
          variant={metric === 'vocabulary' ? 'contained' : 'outlined'}
          onClick={() => setMetric('vocabulary')}
        >
          Vocabulary
        </Button>
        <Button
          size="small"
          variant={metric === 'fluency' ? 'contained' : 'outlined'}
          onClick={() => setMetric('fluency')}
        >
          Fluency
        </Button>
        <Button
          size="small"
          variant={metric === 'confidence' ? 'contained' : 'outlined'}
          onClick={() => setMetric('confidence')}
        >
          Confidence
        </Button>
      </Stack>

      <Stack
        sx={{
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.12)',
          padding: '20px',
        }}
      >
        <ProgressChart data={data} metric={metric} />
      </Stack>
    </Stack>
  );
};
