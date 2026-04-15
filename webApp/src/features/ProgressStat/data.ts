import type { ProgressMetric } from './types';

export const PROGRESS_ALGORITHM_VERSION = 'score_v1';

export const PROGRESS_METRICS: ProgressMetric[] = [
  'grammar',
  'vocabulary',
  'fluency',
  'confidence',
];

export const METRIC_COLOR: Record<ProgressMetric, string> = {
  grammar: '#4da3ff',
  vocabulary: '#43e67b',
  fluency: '#ff9a3d',
  confidence: '#8f7cff',
};
