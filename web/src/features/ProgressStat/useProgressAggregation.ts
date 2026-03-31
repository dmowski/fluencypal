import { useMemo } from 'react';
import { ProgressChartPoint, ProgressMetric, ProgressStat } from './types';

const METRICS: ProgressMetric[] = ['grammar', 'vocabulary', 'fluency', 'confidence'];

const DEFAULT_WINDOW_SIZE = 5;

export interface ProgressAggregationOptions {
  /** Only include records with assessmentConfidence >= this value. Default: disabled. */
  minConfidence?: number;
  /** Rolling average window size. Default: 5. */
  windowSize?: number;
}

interface DailyAggregate {
  dayKey: string;
  count: number;
  createdAt: number;
  createdAtIso: string;
  grammar: number;
  vocabulary: number;
  fluency: number;
  confidence: number;
}

const getDayKey = (stat: ProgressStat): string => {
  return stat.createdAtIso.split('T')[0];
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
        createdAt: stat.createdAt,
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

    if (stat.createdAt > current.createdAt) {
      current.createdAt = stat.createdAt;
      current.createdAtIso = stat.createdAtIso;
    }
  });

  return Array.from(dayAggregates.values()).map((daily) => ({
    id: `day_${daily.dayKey}`,
    createdAt: daily.createdAt,
    createdAtIso: daily.createdAtIso,
    grammar: daily.grammar / daily.count,
    vocabulary: daily.vocabulary / daily.count,
    fluency: daily.fluency / daily.count,
    confidence: daily.confidence / daily.count,
  }));
};

function aggregateStats(
  stats: ProgressStat[],
  minConfidence: number | undefined,
  windowSize: number,
): ProgressChartPoint[] {
  const sorted = [...stats].sort((a, b) => a.createdAt - b.createdAt);
  const filtered =
    minConfidence !== undefined
      ? sorted.filter((s) => s.assessmentConfidence >= minConfidence)
      : sorted;

  const dailyPoints = aggregateByDay(filtered);

  return dailyPoints.map((point, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const window = dailyPoints.slice(start, index + 1);

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

  return useMemo(
    () => aggregateStats(stats, minConfidence, windowSize),
    [stats, minConfidence, windowSize],
  );
};
