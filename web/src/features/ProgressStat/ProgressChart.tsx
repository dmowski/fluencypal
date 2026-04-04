'use client';

import {
  ProgressChartPoint,
  ProgressMetric,
  ProgressValueMode,
  ProgressChartStatus,
} from './types';
import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area,
} from 'recharts';
import dayjs from 'dayjs';
import Stack from '@mui/material/Stack';
import { ProgressChartLoadingState } from './ProgressChartLoadingState';
import { ProgressChartStateOverlay } from './ProgressChartStateOverlay';
import { useLingui } from '@lingui/react';

interface ProgressChartProps {
  data: ProgressChartPoint[];
  metric: ProgressMetric;
  height?: number;
  valueMode?: ProgressValueMode;
  status?: ProgressChartStatus;
  emptyPreviewData?: ProgressChartPoint[];
}

interface XAxisTickProps {
  x?: number;
  y?: number;
  payload?: {
    value: number;
  };
}

const metricColorMap: Record<ProgressMetric, string> = {
  grammar: '#4da3ff',
  vocabulary: '#43e67b',
  fluency: '#ff9a3d',
  confidence: '#8f7cff',
};

const metricLabelMap: Record<ProgressMetric, string> = {
  grammar: 'Grammar',
  vocabulary: 'Vocabulary',
  fluency: 'Fluency',
  confidence: 'Confidence',
};

export const ProgressChart = ({
  data,
  metric,
  height = 400,
  valueMode = 'raw',
  status = 'ready',
  emptyPreviewData,
}: ProgressChartProps) => {
  const { i18n } = useLingui();
  const previewData = status === 'empty' ? (emptyPreviewData ?? data) : data;

  if (status === 'loading') {
    return <ProgressChartLoadingState height={height} />;
  }

  if (!previewData.length) {
    return <div style={{ color: '#c4c9d4' }}>No data yet.</div>;
  }

  const smoothedMetricMap: Record<ProgressMetric, keyof ProgressChartPoint> = {
    grammar: 'grammarSmoothed',
    vocabulary: 'vocabularySmoothed',
    fluency: 'fluencySmoothed',
    confidence: 'confidenceSmoothed',
  };

  const rawMetricMap: Record<ProgressMetric, keyof ProgressChartPoint> = {
    grammar: 'grammar',
    vocabulary: 'vocabulary',
    fluency: 'fluency',
    confidence: 'confidence',
  };

  const preferredDataKey =
    valueMode === 'smoothed' ? smoothedMetricMap[metric] : rawMetricMap[metric];
  const hasPreferredData = data.some((point) => typeof point[preferredDataKey] === 'number');
  const chartDataKey = hasPreferredData ? preferredDataKey : rawMetricMap[metric];

  const renderXAxisTick = ({ x = 0, y = 0, payload }: XAxisTickProps) => {
    const value = String(payload?.value ?? '');
    const label = dayjs(value).format('MMM D');
    const adjustedX = x;

    return (
      <text x={adjustedX} y={y} fill="rgba(233,238,252,0.72)" fontSize="12" textAnchor={'middle'}>
        {label}
      </text>
    );
  };

  return (
    <div style={{ width: '100%', height }}>
      <Stack sx={{ position: 'relative' }}>
        <Stack
          sx={{
            opacity: status === 'empty' ? 0.22 : status === 'locked' ? 0.28 : 1,
            filter: status === 'locked' ? 'blur(1.5px)' : 'none',
          }}
        >
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart
              data={previewData}
              margin={{
                top: 8,
                right: 2,
                left: 10,
                bottom: 18,
              }}
            >
              <defs>
                <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={metricColorMap[metric]} stopOpacity={1} />
                  <stop offset="58%" stopColor={metricColorMap[metric]} stopOpacity={0.24} />
                  <stop offset="100%" stopColor={metricColorMap[metric]} stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis
                dataKey="createdAtIso"
                minTickGap={10}
                tick={renderXAxisTick}
                tickMargin={20}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fill: 'rgba(233,238,252,0.72)', fontSize: 12 }}
                tickMargin={10}
                width={42}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(0)}`, metricLabelMap[metric]]}
                labelFormatter={(value) => dayjs(String(value)).format('MMM D, YYYY (ddd)')}
                separator=": "
                contentStyle={{
                  backgroundColor: '#2b2f37',
                  border: '1px solid #3a404c',
                  borderRadius: '10px',
                  color: '#ffffff',
                  boxShadow: '0 10px 24px rgba(0, 0, 0, 0.35)',
                }}
                itemStyle={{ color: '#ffffff' }}
                labelStyle={{ color: '#ffffff' }}
                cursor={{ stroke: 'rgba(255,255,255,0.35)', strokeDasharray: '3 6' }}
              />
              <Area
                type="monotoneX"
                dataKey={chartDataKey}
                stroke={metricColorMap[metric]}
                strokeWidth={2}
                strokeOpacity={1}
                fill="url(#progressFill)"
                activeDot={{
                  r: 5,
                  fill: '#d9e3ff',
                  stroke: metricColorMap[metric],
                  strokeWidth: 2,
                }}
                dot={false}
                isAnimationActive={false}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Stack>

        {status === 'empty' && (
          <ProgressChartStateOverlay
            title={i18n._('No data yet')}
            description={i18n._(
              'Have a few days of practice and check back here for insights on your learning progress.',
            )}
          />
        )}

        {status === 'processing' && (
          <ProgressChartStateOverlay
            title={i18n._('Processing latest session')}
            description={i18n._('Simulating AI assessment before the chart updates.')}
          />
        )}

        {status === 'locked' && (
          <ProgressChartStateOverlay
            title={i18n._('Progress insights are locked')}
            description={i18n._(
              'Preview state for gated access once production placement is added.',
            )}
          />
        )}
      </Stack>
    </div>
  );
};
