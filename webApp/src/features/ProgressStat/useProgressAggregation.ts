import { useMemo } from 'react';
import { ProgressChartPoint, ProgressMetric, ProgressStat } from './types';

const DEFAULT_WINDOW_SIZE = 5;

export interface ProgressAggregationOptions {
  /** Only include records with assessmentConfidence >= this value. Default: disabled. */
  minConfidence?: number;
  /** Rolling average window size. Default: 5. */
  windowSize?: number;
  /** Fill zero-value points from the last data point up to and including this date (ISO date string, e.g. '2026-04-05'). */
  today?: string;
}

interface DailyAggregate {
  dayKey: string;
  count: number;
  createdAtIso: string;
  grammar: number;
  vocabulary: number;
  fluency: number;
  confidence: number;
}

const getDayKey = (stat: ProgressStat): string => {
  return stat.createdAtIso.split('T')[0];
};

export const fillDailyGaps = (
  points: ProgressChartPoint[],
  today?: string,
): ProgressChartPoint[] => {
  if (points.length === 0) return points;

  const result: ProgressChartPoint[] = [];

  for (let i = 0; i < points.length; i++) {
    result.push(points[i]);

    if (i < points.length - 1) {
      const currentDayKey = points[i].createdAtIso.split('T')[0];
      const nextDayKey = points[i + 1].createdAtIso.split('T')[0];

      const currentDate = new Date(currentDayKey);
      const nextDate = new Date(nextDayKey);
      const diffDays = Math.round(
        (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
      );

      for (let gap = 1; gap < diffDays; gap++) {
        const gapDate = new Date(currentDate);
        gapDate.setUTCDate(gapDate.getUTCDate() + gap);
        const gapDayKey = gapDate.toISOString().split('T')[0];

        result.push({
          id: `day_${gapDayKey}`,
          createdAtIso: `${gapDayKey}T00:00:00.000Z`,
          grammar: 0,
          vocabulary: 0,
          fluency: 0,
          confidence: 0,
        });
      }
    }
  }

  if (today) {
    const lastDayKey = result[result.length - 1].createdAtIso.split('T')[0];
    const lastDate = new Date(lastDayKey);
    const todayDate = new Date(today);
    const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

    for (let gap = 1; gap <= diffDays; gap++) {
      const gapDate = new Date(lastDate);
      gapDate.setUTCDate(gapDate.getUTCDate() + gap);
      const gapDayKey = gapDate.toISOString().split('T')[0];
      const isToday = gapDayKey === today;

      if (!isToday) {
        result.push({
          id: `day_${gapDayKey}`,
          createdAtIso: `${gapDayKey}T00:00:00.000Z`,
          grammar: 0,
          vocabulary: 0,
          fluency: 0,
          confidence: 0,
        });
      }
    }
  }

  return result;
};

const aggregateByDay = (stats: ProgressStat[]): ProgressChartPoint[] => {
  const dayAggregates = new Map<string, DailyAggregate>();

  stats.forEach((stat) => {
    const dayKey = getDayKey(stat);
    const current = dayAggregates.get(dayKey);

    if (!current) {
      dayAggregates.set(dayKey, {
        dayKey,
        count: 1,
        createdAtIso: stat.createdAtIso,
        grammar: stat.grammar,
        vocabulary: stat.vocabulary,
        fluency: stat.fluency,
        confidence: stat.confidence,
      });
      return;
    }

    current.count += 1;
    current.grammar += stat.grammar;
    current.vocabulary += stat.vocabulary;
    current.fluency += stat.fluency;
    current.confidence += stat.confidence;

    if (stat.createdAtIso > current.createdAtIso) {
      current.createdAtIso = stat.createdAtIso;
    }
  });

  return Array.from(dayAggregates.values()).map((daily) => ({
    id: `day_${daily.dayKey}`,
    createdAtIso: daily.createdAtIso,
    grammar: daily.grammar / daily.count,
    vocabulary: daily.vocabulary / daily.count,
    fluency: daily.fluency / daily.count,
    confidence: daily.confidence / daily.count,
  }));
};

export function aggregateStats(
  stats: ProgressStat[],
  minConfidence: number | undefined,
  windowSize: number,
  today?: string,
): ProgressChartPoint[] {
  const sorted = [...stats].sort((a, b) => a.createdAtIso.localeCompare(b.createdAtIso));
  const filtered =
    minConfidence !== undefined
      ? sorted.filter((s) => s.assessmentConfidence >= minConfidence)
      : sorted;

  const dailyPoints = aggregateByDay(filtered);
  const filledPoints = fillDailyGaps(dailyPoints, today);

  return filledPoints.map((point, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const window = filledPoints.slice(start, index + 1);

    const avg = (metric: ProgressMetric) =>
      window.reduce((sum, item) => sum + item[metric], 0) / window.length;

    return {
      ...point,
      grammarSmoothed: avg('grammar'),
      vocabularySmoothed: avg('vocabulary'),
      fluencySmoothed: avg('fluency'),
      confidenceSmoothed: avg('confidence'),
    };
  });
}

export const useProgressAggregation = (
  stats: ProgressStat[],
  options?: ProgressAggregationOptions,
): ProgressChartPoint[] => {
  const minConfidence = options?.minConfidence;
  const windowSize = options?.windowSize ?? DEFAULT_WINDOW_SIZE;
  const today = options?.today;

  return useMemo(
    () => aggregateStats(stats, minConfidence, windowSize, today),
    [stats, minConfidence, windowSize, today],
  );
};
