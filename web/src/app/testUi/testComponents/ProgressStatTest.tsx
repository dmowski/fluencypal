'use client';

import { useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { ProgressChart } from '@/features/ProgressStat/ProgressChart';
import {
  mockProgressChartPoints,
  mockSparseProgressChartPoints,
  mockProgressWaveChartPoints,
} from '@/features/ProgressStat/mockData';
import {
  ProgressChartPoint,
  ProgressChartStatus,
  ProgressMetric,
  ProgressValueMode,
} from '@/features/ProgressStat/types';

type DemoMode = 'steady' | 'wave' | 'sparse' | 'empty' | 'loading' | 'processing' | 'locked';

const buildSmoothedChartPoints = (
  points: ProgressChartPoint[],
  windowSize: number,
): ProgressChartPoint[] => {
  const metrics: ProgressMetric[] = ['grammar', 'vocabulary', 'fluency', 'confidence'];

  return points.map((point, index) => {
    const startIndex = Math.max(0, index - windowSize + 1);
    const windowPoints = points.slice(startIndex, index + 1);
    const nextPoint: ProgressChartPoint = { ...point };

    metrics.forEach((metric) => {
      const total = windowPoints.reduce((sum, item) => sum + item[metric], 0);
      const average = total / windowPoints.length;

      if (metric === 'grammar') nextPoint.grammarSmoothed = average;
      if (metric === 'vocabulary') nextPoint.vocabularySmoothed = average;
      if (metric === 'fluency') nextPoint.fluencySmoothed = average;
      if (metric === 'confidence') nextPoint.confidenceSmoothed = average;
    });

    return nextPoint;
  });
};

const stateLabelMap: Record<DemoMode, string> = {
  steady: 'Steady data',
  wave: 'Volatile data',
  sparse: 'Sparse data',
  empty: 'Empty data',
  loading: 'Loading state',
  processing: 'Processing state',
  locked: 'Locked state',
};

export const ProgressStatTest = () => {
  const [mode, setMode] = useState<DemoMode>('steady');
  const [metric, setMetric] = useState<ProgressMetric>('grammar');
  const [valueMode, setValueMode] = useState<ProgressValueMode>('raw');
  const chartHeight = 400;

  const baseData = useMemo(() => {
    if (mode === 'wave') return mockProgressWaveChartPoints;
    if (mode === 'sparse') return mockSparseProgressChartPoints;
    if (mode === 'empty') return [];
    if (mode === 'processing' || mode === 'locked' || mode === 'loading') {
      return mockProgressChartPoints;
    }
    return mockProgressChartPoints;
  }, [mode]);

  const data = useMemo(() => buildSmoothedChartPoints(baseData, 5), [baseData]);

  const chartStatus: ProgressChartStatus =
    mode === 'loading' || mode === 'processing' || mode === 'locked' || mode === 'empty'
      ? mode
      : 'ready';

  const renderChartBody = () => {
    return (
      <ProgressChart
        data={data}
        metric={metric}
        valueMode={valueMode}
        height={chartHeight}
        status={chartStatus}
        emptyPreviewData={buildSmoothedChartPoints(mockProgressChartPoints, 5)}
      />
    );
  };

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
        {(Object.keys(stateLabelMap) as DemoMode[]).map((demoMode) => (
          <Button
            key={demoMode}
            variant={mode === demoMode ? 'contained' : 'outlined'}
            onClick={() => setMode(demoMode)}
          >
            {stateLabelMap[demoMode]}
          </Button>
        ))}
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

      <Stack direction="row" sx={{ gap: '8px', flexWrap: 'wrap' }}>
        <Button
          size="small"
          variant={valueMode === 'raw' ? 'contained' : 'outlined'}
          onClick={() => setValueMode('raw')}
        >
          Raw values
        </Button>
        <Button
          size="small"
          variant={valueMode === 'smoothed' ? 'contained' : 'outlined'}
          onClick={() => setValueMode('smoothed')}
        >
          Smoothed values
        </Button>
      </Stack>

      <Stack
        sx={{
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.12)',
          background: 'linear-gradient(180deg, rgba(10,18,30,0.88) 0%, rgba(7,13,24,0.94) 100%)',
          padding: '50px 45px 35px 20px',
          gap: '10px',
        }}
      >
        {renderChartBody()}
      </Stack>
    </Stack>
  );
};
