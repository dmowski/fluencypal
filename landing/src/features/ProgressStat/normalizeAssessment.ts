import { ProgressAssessmentResult } from './types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const toScore = (value: unknown, field: string): number => {
  const num = Number(value);
  if (!Number.isFinite(num)) {
    throw new Error(`Invalid numeric field: ${field}`);
  }
  return clamp(num, 0, 100);
};

export const normalizeAssessment = (data: unknown): ProgressAssessmentResult => {
  const objectData = data as Record<string, unknown>;

  return {
    grammar: toScore(objectData?.grammar, 'grammar'),
    grammarSummary: typeof objectData?.grammarSummary === 'string' ? objectData.grammarSummary : '',
    vocabulary: toScore(objectData?.vocabulary, 'vocabulary'),
    vocabularySummary:
      typeof objectData?.vocabularySummary === 'string' ? objectData.vocabularySummary : '',
    fluency: toScore(objectData?.fluency, 'fluency'),
    fluencySummary: typeof objectData?.fluencySummary === 'string' ? objectData.fluencySummary : '',
    confidence: toScore(objectData?.confidence, 'confidence'),
    confidenceSummary:
      typeof objectData?.confidenceSummary === 'string' ? objectData.confidenceSummary : '',

    assessmentConfidence: toScore(objectData?.assessmentConfidence, 'assessmentConfidence'),
    assessmentConfidenceSummary:
      typeof objectData?.assessmentConfidenceSummary === 'string'
        ? objectData.assessmentConfidenceSummary
        : '',
  };
};
