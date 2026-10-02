import {
  normalizeAssessment,
  parseScoreValue,
  repairAssessmentFields,
} from './normalizeAssessment';

describe('parseScoreValue', () => {
  it('parses numeric strings and embedded scores', () => {
    expect(parseScoreValue('72')).toBe(72);
    expect(parseScoreValue('Score: 68/100')).toBe(68);
  });

  it('parses English number words, including concatenated tens', () => {
    expect(parseScoreValue('fifty')).toBe(50);
    expect(parseScoreValue('sixty')).toBe(60);
    expect(parseScoreValue('thirtyfive')).toBe(35);
    expect(parseScoreValue('forty-five')).toBe(45);
    expect(parseScoreValue('Forty Five')).toBe(45);
    expect(parseScoreValue('one hundred')).toBe(100);
    expect(parseScoreValue('Not a score')).toBeNull();
  });
});

describe('repairAssessmentFields', () => {
  it('swaps score and summary when the AI reverses them', () => {
    expect(
      repairAssessmentFields({
        grammar: 'Uses articles well.',
        grammarSummary: '72',
      }),
    ).toEqual({
      grammar: '72',
      grammarSummary: 'Uses articles well.',
    });
  });

  it('promotes prose-only score fields into summaries', () => {
    expect(
      repairAssessmentFields({
        grammar: 'Uses articles well.',
      }),
    ).toEqual({
      grammarSummary: 'Uses articles well.',
    });
  });
});

describe('normalizeAssessment', () => {
  it('coerces numeric strings and clamps scores to 0-100', () => {
    expect(
      normalizeAssessment({
        grammar: '105',
        grammarSummary: 'Strong',
        vocabulary: 10,
        vocabularySummary: 'Basic',
        fluency: 55,
        fluencySummary: 'Steady',
        confidence: 60,
        confidenceSummary: 'Calm',
        assessmentConfidence: '-5',
        assessmentConfidenceSummary: 'Limited sample',
      }),
    ).toEqual({
      grammar: 100,
      grammarSummary: 'Strong',
      vocabulary: 10,
      vocabularySummary: 'Basic',
      fluency: 55,
      fluencySummary: 'Steady',
      confidence: 60,
      confidenceSummary: 'Calm',
      assessmentConfidence: 0,
      assessmentConfidenceSummary: 'Limited sample',
    });
  });

  it('recovers when grammar prose and grammarSummary hold the numeric score', () => {
    expect(
      normalizeAssessment({
        grammar: 'Good tense usage with occasional article slips.',
        grammarSummary: '74',
        vocabulary: 70,
        fluency: 65,
        confidence: 60,
        assessmentConfidence: 55,
      }),
    ).toEqual({
      grammar: 74,
      grammarSummary: 'Good tense usage with occasional article slips.',
      vocabulary: 70,
      vocabularySummary: '',
      fluency: 65,
      fluencySummary: '',
      confidence: 60,
      confidenceSummary: '',
      assessmentConfidence: 55,
      assessmentConfidenceSummary: '',
    });
  });

  it('accepts score fields written as English number words', () => {
    expect(
      normalizeAssessment({
        grammar: 'fifty',
        grammarSummary: 'Basic sentence structures.',
        vocabulary: 'sixty',
        vocabularySummary: 'Everyday words.',
        fluency: 'thirtyfive',
        fluencySummary: 'Hesitant.',
        confidence: 'forty-five',
        confidenceSummary: 'Limited.',
        assessmentConfidence: 'thirty five',
        assessmentConfidenceSummary: 'Short sample.',
      }),
    ).toEqual({
      grammar: 50,
      grammarSummary: 'Basic sentence structures.',
      vocabulary: 60,
      vocabularySummary: 'Everyday words.',
      fluency: 35,
      fluencySummary: 'Hesitant.',
      confidence: 45,
      confidenceSummary: 'Limited.',
      assessmentConfidence: 35,
      assessmentConfidenceSummary: 'Short sample.',
    });
  });

  it('rejects payloads that still lack required numeric scores', () => {
    expect(() =>
      normalizeAssessment({
        grammar: 'Not a score',
        grammarSummary: 'Summary only',
        vocabulary: 50,
        fluency: 50,
        confidence: 50,
        assessmentConfidence: 50,
      }),
    ).toThrow('Invalid numeric field: grammar');
  });
});
