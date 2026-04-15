import dayjs from 'dayjs';
import type { ProgressMetric, ProgressStat } from './types';
import { PROGRESS_METRICS } from './data';

export interface RadarDataPoint {
  metric: ProgressMetric;
  value: number;
}

export interface RadarChartData {
  lastMonth: RadarDataPoint[] | null;
  previousMonth: RadarDataPoint[] | null;
}

export function getRadarChartData(stats: ProgressStat[]): RadarChartData {
  const now = dayjs();

  const lastMonthStart = now.subtract(1, 'month').startOf('month');
  const lastMonthEnd = now.subtract(1, 'month').endOf('month');

  const prevMonthStart = now.subtract(2, 'month').startOf('month');
  const prevMonthEnd = now.subtract(2, 'month').endOf('month');

  function averageForPeriod(
    start: ReturnType<typeof dayjs>,
    end: ReturnType<typeof dayjs>,
  ): RadarDataPoint[] | null {
    const filtered = stats.filter((s) => {
      const ts = dayjs(s.createdAtIso).valueOf();
      return ts >= start.valueOf() && ts <= end.valueOf();
    });

    if (filtered.length === 0) return null;

    return PROGRESS_METRICS.map((metric) => ({
      metric,
      value: Math.round(filtered.reduce((sum, s) => sum + s[metric], 0) / filtered.length),
    }));
  }

  return {
    lastMonth: averageForPeriod(lastMonthStart, lastMonthEnd),
    previousMonth: averageForPeriod(prevMonthStart, prevMonthEnd),
  };
}
