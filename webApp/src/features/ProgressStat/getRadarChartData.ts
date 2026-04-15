import dayjs, { type Dayjs } from 'dayjs';
import type { ProgressMetric, ProgressStat } from './types';
import { PROGRESS_METRICS } from './data';

export interface RadarDataPoint {
  metric: ProgressMetric;
  value: number;
}

export interface RadarComparisonPoint {
  metric: ProgressMetric;
  lastMonth: number;
  previousMonth: number;
}

export interface PeriodRange {
  start: string;
  end: string;
}

export interface RadarChartData {
  lastMonth: RadarDataPoint[] | null;
  lastMonthRange: PeriodRange;
  previousMonth: RadarDataPoint[] | null;
  previousMonthRange: PeriodRange;
  comparison: RadarComparisonPoint[] | null;
}

export function getRadarChartData(stats: ProgressStat[]): RadarChartData {
  const now = dayjs();

  // Last 30 days: [now-30d, now]
  const lastMonthEnd = now;
  const lastMonthStart = now.subtract(30, 'day');

  // Previous 30 days: [now-60d, now-31d]
  const prevMonthEnd = now.subtract(31, 'day');
  const prevMonthStart = now.subtract(60, 'day');

  const DATE_FORMAT = 'MMM D';

  function averageForPeriod(start: Dayjs, end: Dayjs): RadarDataPoint[] | null {
    const startMs = start.valueOf();
    const endMs = end.valueOf();
    const filtered = stats.filter((s) => {
      const ts = dayjs(s.createdAtIso).valueOf();
      return ts >= startMs && ts <= endMs;
    });

    if (filtered.length === 0) return null;

    return PROGRESS_METRICS.map((metric) => ({
      metric,
      value: Math.round(filtered.reduce((sum, s) => sum + s[metric], 0) / filtered.length),
    }));
  }

  const lastMonth = averageForPeriod(lastMonthStart, lastMonthEnd);
  const previousMonth = averageForPeriod(prevMonthStart, prevMonthEnd);

  const hasComparison = lastMonth !== null || previousMonth !== null;
  const comparison: RadarComparisonPoint[] | null = hasComparison
    ? PROGRESS_METRICS.map((metric) => ({
        metric,
        lastMonth: lastMonth?.find((p) => p.metric === metric)?.value ?? 0,
        previousMonth: previousMonth?.find((p) => p.metric === metric)?.value ?? 0,
      }))
    : null;

  return {
    lastMonth,
    lastMonthRange: {
      start: lastMonthStart.format(DATE_FORMAT),
      end: lastMonthEnd.format(DATE_FORMAT),
    },
    previousMonth,
    previousMonthRange: {
      start: prevMonthStart.format(DATE_FORMAT),
      end: prevMonthEnd.format(DATE_FORMAT),
    },
    comparison,
  };
}
