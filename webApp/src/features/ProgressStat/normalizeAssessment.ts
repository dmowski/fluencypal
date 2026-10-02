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

const ONES: Record<string, number> = {
  zero: 0,
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
  sixteen: 16,
  seventeen: 17,
  eighteen: 18,
  nineteen: 19,
};

const TENS: Record<string, number> = {
  twenty: 20,
  thirty: 30,
  forty: 40,
  fifty: 50,
  sixty: 60,
  seventy: 70,
  eighty: 80,
  ninety: 90,
};

/** Whole-string English integers from 0 to 100, including "thirtyfive" and "forty-five". */
const parseEnglishNumberWord = (raw: string): number | null => {
  const normalized = raw
    .toLowerCase()
    .replace(/[^a-z\s-]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (!normalized) return null;

  if (normalized === 'hundred' || normalized === 'a hundred' || normalized === 'one hundred') {
    return 100;
  }

  if (Object.prototype.hasOwnProperty.call(ONES, normalized)) return ONES[normalized];
  if (Object.prototype.hasOwnProperty.call(TENS, normalized)) return TENS[normalized];

  const parts = normalized.split(/[\s-]+/).filter(Boolean);
  if (
    parts.length === 2 &&
    Object.prototype.hasOwnProperty.call(TENS, parts[0]) &&
    Object.prototype.hasOwnProperty.call(ONES, parts[1]) &&
    ONES[parts[1]] < 10
  ) {
    return TENS[parts[0]] + ONES[parts[1]];
  }

  if (parts.length === 1) {
    for (const [tensWord, tensValue] of Object.entries(TENS)) {
      if (!normalized.startsWith(tensWord) || normalized.length === tensWord.length) continue;
      const rest = normalized.slice(tensWord.length);
      if (Object.prototype.hasOwnProperty.call(ONES, rest) && ONES[rest] < 10) {
        return tensValue + ONES[rest];
      }
    }
  }

  return null;
};

export const parseScoreValue = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;

    const direct = Number(trimmed);
    if (Number.isFinite(direct)) return direct;

    const word = parseEnglishNumberWord(trimmed);
    if (word !== null) return word;

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
