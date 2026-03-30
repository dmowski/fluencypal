'use client';

import { ProgressChartPoint, ProgressMetric } from './types';
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

interface ProgressChartProps {
  data: ProgressChartPoint[];
  metric: ProgressMetric;
  height?: number;
}

const metricColorMap: Record<ProgressMetric, string> = {
  grammar: '#4da3ff',
  vocabulary: '#43e67b',
  fluency: '#ff9a3d',
  confidence: '#8f7cff',
};

export const ProgressChart = ({ data, metric, height = 260 }: ProgressChartProps) => {
  if (!data.length) {
    return <div style={{ color: '#c4c9d4' }}>No data yet.</div>;
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 8,
            right: 14,
            left: 0,
            bottom: 6,
          }}
        >
          <defs>
            <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={metricColorMap[metric]} stopOpacity={0.18} />
              <stop offset="100%" stopColor={metricColorMap[metric]} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 5" stroke="rgba(255,255,255,0.18)" vertical={false} />
          <XAxis
            dataKey="createdAt"
            tickFormatter={(value: number) => dayjs(value).format('MMM D')}
            minTickGap={24}
            tick={{ fill: 'rgba(233,238,252,0.72)', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.22)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.22)' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: 'rgba(233,238,252,0.72)', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.22)' }}
            tickLine={{ stroke: 'rgba(255,255,255,0.22)' }}
          />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(0)}`}
            labelFormatter={(value) => dayjs(Number(value)).format('MMM D, YYYY')}
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
            dataKey={metric}
            stroke={metricColorMap[metric]}
            strokeWidth={2}
            strokeOpacity={1}
            fill="url(#progressFill)"
            activeDot={{ r: 5, fill: '#d9e3ff', stroke: metricColorMap[metric], strokeWidth: 2 }}
            dot={false}
            isAnimationActive={false}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
