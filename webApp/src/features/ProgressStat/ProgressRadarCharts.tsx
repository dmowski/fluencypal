'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend } from 'recharts';
import { ArrowUp, ArrowDown } from 'lucide-react';
import type { ProgressStat } from './types';
import {
  getRadarChartData,
  type RadarDataPoint,
  type RadarComparisonPoint,
  type MetricDiff,
} from './getRadarChartData';
import { METRIC_COLOR } from './data';

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDataForChart(data: RadarDataPoint[]) {
  return data.map((d) => ({ ...d, metric: capitalize(d.metric) }));
}

function formatComparisonForChart(data: RadarComparisonPoint[]) {
  return data.map((d) => ({ ...d, metric: capitalize(d.metric) }));
}

const LAST_MONTH_COLOR = '#8f7cff';
const PREV_MONTH_COLOR = '#4da3ff';

function MetricDiffSummary({ diffs }: { diffs: MetricDiff[] }) {
  const { i18n } = useLingui();
  return (
    <Stack sx={{ gap: '8px' }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {i18n._('Changes vs previous 30 days')}
      </Typography>
      <Stack sx={{ flexWrap: 'wrap', gap: '10px' }}>
        {diffs.map(({ metric, diff }) => {
          const isPositive = diff >= 0;
          const changeColor = isPositive ? 'oklch(76.5% .177 163.223)' : 'oklch(70.4% .191 22.216)';
          return (
            <Stack key={metric} sx={{ flexDirection: 'row', alignItems: 'center', gap: '12px' }}>
              <Stack
                sx={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: METRIC_COLOR[metric],
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {metric.charAt(0).toUpperCase() + metric.slice(1)}
              </Typography>
              <Stack sx={{ flexDirection: 'row', alignItems: 'center', color: changeColor }}>
                {isPositive ? (
                  <ArrowUp size={14} strokeWidth={2.5} />
                ) : (
                  <ArrowDown size={14} strokeWidth={2.5} />
                )}
                <Typography variant="body2" sx={{ fontWeight: 700, color: changeColor }}>
                  {Math.abs(diff)}%
                </Typography>
              </Stack>
            </Stack>
          );
        })}
      </Stack>
    </Stack>
  );
}

function NoData() {
  const { i18n } = useLingui();
  return (
    <Stack sx={{ height: 400, alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {i18n._('No data to show.')}
      </Typography>
    </Stack>
  );
}

function ComparisonRadarChart({ data }: { data: RadarComparisonPoint[] }) {
  const chartData = formatComparisonForChart(data);

  return (
    <RadarChart data={chartData} width={500} height={400}>
      <PolarGrid stroke="rgba(255,255,255,0.15)" />
      <PolarAngleAxis
        dataKey="metric"
        tickSize={20}
        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
      />
      <PolarRadiusAxis
        angle={90}
        domain={[0, 100]}
        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
        tickCount={4}
      />
      <Radar
        name="Last 30 days"
        dataKey="lastMonth"
        stroke={LAST_MONTH_COLOR}
        fill={LAST_MONTH_COLOR}
        fillOpacity={0.25}
        strokeWidth={2}
      />
      <Radar
        name="Previous 30 days"
        dataKey="previousMonth"
        stroke={PREV_MONTH_COLOR}
        fill={PREV_MONTH_COLOR}
        fillOpacity={0.25}
        strokeWidth={2}
      />
      <Legend wrapperStyle={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', paddingTop: 8 }} />
    </RadarChart>
  );
}

function SingleRadarChart({ data, color }: { data: RadarDataPoint[]; color: string }) {
  const chartData = formatDataForChart(data);

  return (
    <RadarChart data={chartData} width={500} height={400}>
      <PolarGrid stroke="rgba(255,255,255,0.15)" />
      <PolarAngleAxis
        dataKey="metric"
        tickSize={20}
        tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
      />
      <PolarRadiusAxis
        angle={90}
        domain={[0, 100]}
        tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
        tickCount={4}
      />
      <Radar dataKey="value" stroke={color} fill={color} fillOpacity={0.3} strokeWidth={2} />
    </RadarChart>
  );
}

export const ProgressRadarCharts = ({ stats }: { stats: ProgressStat[] }) => {
  const { i18n } = useLingui();
  const { lastMonth, lastMonthRange, previousMonth, previousMonthRange, comparison, diffs } =
    getRadarChartData(stats);

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
    <Stack sx={{ paddingTop: '80px', gap: '48px' }}>
      <Stack sx={{ gap: '4px' }}>
        <Typography variant="h3" sx={{ fontWeight: 900 }}>
          {i18n._('Monthly overview')}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {i18n._('Average scores across grammar, vocabulary, fluency, and confidence.')}
        </Typography>
      </Stack>

      <Stack
        sx={{
          gap: '150px',
        }}
      >
        {/* Individual period charts */}
        <Stack sx={{ flexDirection: 'column', gap: '32px' }}>
          <Stack sx={{ flex: 1, gap: '4px' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {i18n._('Last 30 days')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {lastMonthRange.start} – {lastMonthRange.end}
            </Typography>
            {lastMonth ? (
              <SingleRadarChart data={lastMonth} color={LAST_MONTH_COLOR} />
            ) : (
              <NoData />
            )}
          </Stack>

          <Stack sx={{ flex: 1, gap: '4px' }}>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              {i18n._('Previous 30 days')}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {previousMonthRange.start} – {previousMonthRange.end}
            </Typography>
            {previousMonth ? (
              <SingleRadarChart data={previousMonth} color={PREV_MONTH_COLOR} />
            ) : (
              <NoData />
            )}
          </Stack>
        </Stack>

        {/* Comparison overlay chart */}
        {comparison && (
          <Stack sx={{ gap: '16px' }}>
            <Stack sx={{ gap: '4px' }}>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {i18n._('Comparison')}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {i18n._('Last 30 days vs previous 30 days — see how your metrics shifted.')}
              </Typography>
            </Stack>
            <ComparisonRadarChart data={comparison} />
            {diffs && <MetricDiffSummary diffs={diffs} />}
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
