import { ProgressAssessmentResult } from './types';

const SCORE_FIELDS = [
  'grammar',
  'vocabulary',
  'fluency',
  'confidence',
  'assessmentConfidence',
] as const;

type ScoreField = (typeof SCORE_FIELDS)[number];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const parseScoreValue = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const direct = Number(trimmed);
    if (Number.isFinite(direct)) return direct;

    const match = trimmed.match(/\b(\d{1,3})\b/);
    if (match) {
      const extracted = Number(match[1]);
      if (Number.isFinite(extracted)) return extracted;
    }
  }

  return null;
};

const toSummary = (value: unknown): string => (typeof value === 'string' ? value : '');

/** Repair common AI field swaps before strict numeric parsing. */
export const repairAssessmentFields = (data: Record<string, unknown>): Record<string, unknown> => {
  const next: Record<string, unknown> = { ...data };

  for (const field of SCORE_FIELDS) {
    const summaryField = `${field}Summary`;
    const score = next[field];
    const summary = next[summaryField];
    const parsedScore = parseScoreValue(score);
    const parsedFromSummary = parseScoreValue(summary);

    if (parsedScore === null && parsedFromSummary !== null && typeof score === 'string' && score.trim()) {
      next[field] = summary;
      next[summaryField] = score;
      continue;
    }

    if (parsedScore === null && typeof score === 'string' && score.trim() && summary === undefined) {
      next[summaryField] = score;
      delete next[field];
    }
  }

  return next;
};

const toScore = (value: unknown, field: ScoreField): number => {
  const num = parseScoreValue(value);
  if (num === null) {
    throw new Error(`Invalid numeric field: ${field}`);
  }
  return clamp(num, 0, 100);
};

export const normalizeAssessment = (data: unknown): ProgressAssessmentResult => {
  const objectData = repairAssessmentFields((data ?? {}) as Record<string, unknown>);

  return {
    grammar: toScore(objectData.grammar, 'grammar'),
    grammarSummary: toSummary(objectData.grammarSummary),
    vocabulary: toScore(objectData.vocabulary, 'vocabulary'),
    vocabularySummary: toSummary(objectData.vocabularySummary),
    fluency: toScore(objectData.fluency, 'fluency'),
    fluencySummary: toSummary(objectData.fluencySummary),
    confidence: toScore(objectData.confidence, 'confidence'),
    confidenceSummary: toSummary(objectData.confidenceSummary),
    assessmentConfidence: toScore(objectData.assessmentConfidence, 'assessmentConfidence'),
    assessmentConfidenceSummary: toSummary(objectData.assessmentConfidenceSummary),
  };
};
