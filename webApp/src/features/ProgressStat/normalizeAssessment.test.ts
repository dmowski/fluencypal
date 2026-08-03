import { normalizeAssessment } from './normalizeAssessment';

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
});
