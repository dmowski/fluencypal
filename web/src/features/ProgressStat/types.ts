import { SupportedLanguage } from '@/features/Lang/lang';

export type ProgressMetric = 'grammar' | 'vocabulary' | 'fluency' | 'confidence';

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
  createdAt: number;
  createdAtIso: string;
}

export interface ProgressChartPoint {
  id: string;
  createdAt: number;
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
