import { aggregateStats, fillDailyGaps } from './useProgressAggregation';
import { ProgressChartPoint, ProgressStat } from './types';

const makeStat = (
  dateIso: string,
  overrides: Partial<
    Pick<ProgressStat, 'grammar' | 'vocabulary' | 'fluency' | 'confidence' | 'assessmentConfidence'>
  >,
): ProgressStat =>
  ({
    userId: 'user1',
    language: 'en',
    sourceType: 'conversation',
    sourceText: '',
    sourceId: 'src1',
    textLength: 100,
    algorithmVersion: '1',
    createdAtIso: dateIso,
    grammar: 80,
    grammarSummary: '',
    vocabulary: 80,
    vocabularySummary: '',
    fluency: 80,
    fluencySummary: '',
    confidence: 80,
    confidenceSummary: '',
    assessmentConfidence: 1,
    assessmentConfidenceSummary: '',
    ...overrides,
  }) as ProgressStat;

const makePoint = (dayKey: string, value: number): ProgressChartPoint => ({
  id: `day_${dayKey}`,
  createdAtIso: `${dayKey}T00:00:00.000Z`,
  grammar: value,
  vocabulary: value,
  fluency: value,
  confidence: value,
});

// ─── fillDailyGaps ───────────────────────────────────────────────────────────

describe('fillDailyGaps', () => {
  it('returns an empty array unchanged', () => {
    expect(fillDailyGaps([])).toEqual([]);
  });

  it('returns a single-element array unchanged', () => {
    const points = [makePoint('2026-01-01', 50)];
    expect(fillDailyGaps(points)).toEqual(points);
  });

  it('returns consecutive days unchanged', () => {
    const points = [makePoint('2026-01-01', 50), makePoint('2026-01-02', 60)];
    expect(fillDailyGaps(points)).toEqual(points);
  });

  it('inserts one zero-value point for a single missing day', () => {
    const points = [makePoint('2026-01-01', 50), makePoint('2026-01-03', 60)];
    const result = fillDailyGaps(points);

    expect(result).toHaveLength(3);
    expect(result[1].id).toBe('day_2026-01-02');
    expect(result[1].grammar).toBe(0);
    expect(result[1].vocabulary).toBe(0);
    expect(result[1].fluency).toBe(0);
    expect(result[1].confidence).toBe(0);
    expect(result[1].createdAtIso).toBe('2026-01-02T00:00:00.000Z');
    expect(result[2]).toEqual(makePoint('2026-01-03', 60));
  });

  it('inserts multiple zero-value points for a multi-day gap', () => {
    const points = [makePoint('2026-01-01', 50), makePoint('2026-01-05', 60)];
    const result = fillDailyGaps(points);

    expect(result).toHaveLength(5);
    expect(result.map((p) => p.id)).toEqual([
      'day_2026-01-01',
      'day_2026-01-02',
      'day_2026-01-03',
      'day_2026-01-04',
      'day_2026-01-05',
    ]);
    result.slice(1, 4).forEach((p) => {
      expect(p.grammar).toBe(0);
      expect(p.vocabulary).toBe(0);
      expect(p.fluency).toBe(0);
      expect(p.confidence).toBe(0);
    });
  });

  it('fills gaps in multiple separate intervals', () => {
    const points = [
      makePoint('2026-01-01', 50),
      makePoint('2026-01-03', 60),
      makePoint('2026-01-06', 70),
    ];
    const result = fillDailyGaps(points);

    expect(result).toHaveLength(6);
    expect(result.map((p) => p.id)).toEqual([
      'day_2026-01-01',
      'day_2026-01-02',
      'day_2026-01-03',
      'day_2026-01-04',
      'day_2026-01-05',
      'day_2026-01-06',
    ]);
  });
});

// ─── aggregateStats ───────────────────────────────────────────────────────────

describe('aggregateStats', () => {
  it('returns empty array for empty input', () => {
    expect(aggregateStats([], undefined, 5)).toEqual([]);
  });

  it('produces gap-filled zero points for missing days', () => {
    const stats = [
      makeStat('2026-01-01T10:00:00.000Z', {
        grammar: 80,
        vocabulary: 80,
        fluency: 80,
        confidence: 80,
      }),
      makeStat('2026-01-03T10:00:00.000Z', {
        grammar: 60,
        vocabulary: 60,
        fluency: 60,
        confidence: 60,
      }),
    ];

    const result = aggregateStats(stats, undefined, 1);

    expect(result).toHaveLength(3);

    const gapPoint = result[1];
    expect(gapPoint.id).toBe('day_2026-01-02');
    expect(gapPoint.grammar).toBe(0);
    expect(gapPoint.grammarSmoothed).toBe(0);
  });

  it('fills multiple consecutive missing days with zeros', () => {
    const stats = [
      makeStat('2026-02-01T12:00:00.000Z', { grammar: 90 }),
      makeStat('2026-02-05T12:00:00.000Z', { grammar: 70 }),
    ];

    const result = aggregateStats(stats, undefined, 1);
    expect(result).toHaveLength(5);

    const ids = result.map((p) => p.id);
    expect(ids).toEqual([
      'day_2026-02-01',
      'day_2026-02-02',
      'day_2026-02-03',
      'day_2026-02-04',
      'day_2026-02-05',
    ]);

    result.slice(1, 4).forEach((p) => {
      expect(p.grammar).toBe(0);
    });
  });

  it('does not insert gaps when days are consecutive', () => {
    const stats = [
      makeStat('2026-03-01T08:00:00.000Z', { grammar: 70 }),
      makeStat('2026-03-02T08:00:00.000Z', { grammar: 80 }),
      makeStat('2026-03-03T08:00:00.000Z', { grammar: 90 }),
    ];

    const result = aggregateStats(stats, undefined, 1);
    expect(result).toHaveLength(3);
  });

  it('smoothed values factor in zero-filled gap days', () => {
    // Day 1: value 80, day 2: gap (0), day 3: value 80
    // With windowSize=3, day-3 smoothed should average [80, 0, 80] = 53.33...
    const stats = [
      makeStat('2026-04-01T00:00:00.000Z', {
        grammar: 80,
        vocabulary: 80,
        fluency: 80,
        confidence: 80,
      }),
      makeStat('2026-04-03T00:00:00.000Z', {
        grammar: 80,
        vocabulary: 80,
        fluency: 80,
        confidence: 80,
      }),
    ];

    const result = aggregateStats(stats, undefined, 3);
    expect(result).toHaveLength(3);

    const day3 = result[2];
    expect(day3.grammarSmoothed).toBeCloseTo((80 + 0 + 80) / 3, 5);
  });

  it('respects minConfidence filter before gap filling', () => {
    const stats = [
      makeStat('2026-05-01T00:00:00.000Z', { assessmentConfidence: 0.5 }),
      makeStat('2026-05-03T00:00:00.000Z', { assessmentConfidence: 0.9 }),
    ];

    // With minConfidence=0.8, the first stat is filtered out → only one point, no gap
    const result = aggregateStats(stats, 0.8, 5);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('day_2026-05-03');
  });

  it('sorts out-of-order stats before processing', () => {
    const stats = [
      makeStat('2026-06-03T00:00:00.000Z', { grammar: 60 }),
      makeStat('2026-06-01T00:00:00.000Z', { grammar: 80 }),
    ];

    const result = aggregateStats(stats, undefined, 1);
    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('day_2026-06-01');
    expect(result[2].id).toBe('day_2026-06-03');
  });
});
