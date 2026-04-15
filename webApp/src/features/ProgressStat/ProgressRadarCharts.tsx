'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import type { ProgressStat } from './types';
import { getRadarChartData, type RadarDataPoint } from './getRadarChartData';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDataForChart(data: RadarDataPoint[]) {
  return data.map((d) => ({ ...d, metric: capitalize(d.metric) }));
}

function SingleRadarChart({ data, color }: { data: RadarDataPoint[]; color: string }) {
  const chartData = formatDataForChart(data);

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={chartData}>
        <PolarGrid stroke="rgba(255,255,255,0.15)" />
        <PolarAngleAxis dataKey="metric" tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }} />
        <PolarRadiusAxis
          angle={90}
          domain={[0, 100]}
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
          tickCount={4}
        />
        <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.3} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

export const ProgressRadarCharts = ({ stats }: { stats: ProgressStat[] }) => {
  const { i18n } = useLingui();
  const { lastMonth, previousMonth } = getRadarChartData(stats);

  if (!lastMonth && !previousMonth) {
    return (
      <Stack sx={{ paddingTop: '80px', gap: '16px' }}>
        <Typography variant="h3" sx={{ fontWeight: 900 }}>
          {i18n._('Monthly overview')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {i18n._('No data to show.')}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack sx={{ paddingTop: '80px', gap: '24px' }}>
      <Typography variant="h3" sx={{ fontWeight: 900 }}>
        {i18n._('Monthly overview')}
      </Typography>

      <Stack
        sx={{
          flexDirection: { xs: 'column', sm: 'row' },
          gap: '32px',
        }}
      >
        <Stack sx={{ flex: 1, gap: '12px' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: 'center' }}>
            {i18n._('Last month')}
          </Typography>
          {lastMonth ? (
            <SingleRadarChart data={lastMonth} color="#8f7cff" />
          ) : (
            <Stack sx={{ height: 260, alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {i18n._('No data to show.')}
              </Typography>
            </Stack>
          )}
        </Stack>

        <Stack sx={{ flex: 1, gap: '12px' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, textAlign: 'center' }}>
            {i18n._('Previous month')}
          </Typography>
          {previousMonth ? (
            <SingleRadarChart data={previousMonth} color="#4da3ff" />
          ) : (
            <Stack sx={{ height: 260, alignItems: 'center', justifyContent: 'center' }}>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {i18n._('No data to show.')}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};
