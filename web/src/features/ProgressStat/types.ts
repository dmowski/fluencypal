import { SupportedLanguage } from '@/features/Lang/lang';

export type ProgressMetric = 'grammar' | 'vocabulary' | 'fluency' | 'confidence';

export type ProgressValueMode = 'raw' | 'smoothed';

export type ProgressChartStatus = 'ready' | 'empty' | 'loading' | 'processing' | 'locked';

export type ProgressSourceType = 'conversation' | 'role-play';

export interface ProgressAssessmentResult {
  grammar: number;
  vocabulary: number;
  fluency: number;
  confidence: number;
  assessmentConfidence: number;
}

export interface ProgressStat extends ProgressAssessmentResult {
  userId: string;
  language: SupportedLanguage;
  sourceType: ProgressSourceType;
  sourceId: string;
  textLength: number;
  algorithmVersion: string;
  createdAtIso: string;
}

export interface ProgressChartPoint {
  id: string;
  createdAtIso: string;
  grammar: number;
  vocabulary: number;
  fluency: number;
  confidence: number;
  grammarSmoothed?: number;
  vocabularySmoothed?: number;
  fluencySmoothed?: number;
  confidenceSmoothed?: number;
}
