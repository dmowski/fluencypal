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

  return filtered.map((stat, index) => {
    const start = Math.max(0, index - windowSize + 1);
    const window = filtered.slice(start, index + 1);

    const avg = (metric: ProgressMetric) =>
      window.reduce((sum, s) => sum + s[metric], 0) / window.length;

    return {
      id: `${stat.sourceType}_${stat.sourceId}`,
      createdAt: stat.createdAt,
      createdAtIso: stat.createdAtIso,
      grammar: stat.grammar,
      vocabulary: stat.vocabulary,
      fluency: stat.fluency,
      confidence: stat.confidence,
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
