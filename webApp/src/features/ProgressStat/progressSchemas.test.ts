import { progressAssessmentSchema } from './progressSchemas';

describe('progressAssessmentSchema', () => {
  it('coerces numeric strings and defaults missing summaries', () => {
    const result = progressAssessmentSchema.parse({
      grammar: '72',
      grammarSummary: 'Good tense usage.',
      vocabulary: 65,
      fluency: '58',
      confidence: 70,
      assessmentConfidence: '40',
    });

    expect(result).toEqual({
      grammar: 72,
      grammarSummary: 'Good tense usage.',
      vocabulary: 65,
      vocabularySummary: '',
      fluency: 58,
      fluencySummary: '',
      confidence: 70,
      confidenceSummary: '',
      assessmentConfidence: 40,
      assessmentConfidenceSummary: '',
    });
  });

  it('recovers swapped grammar score and summary fields', () => {
    const result = progressAssessmentSchema.parse({
      grammar: 'Good tense usage.',
      grammarSummary: '72',
      vocabulary: 65,
      fluency: '58',
      confidence: 70,
      assessmentConfidence: '40',
    });

    expect(result.grammar).toBe(72);
    expect(result.grammarSummary).toBe('Good tense usage.');
  });

  it('rejects payloads missing required numeric scores', () => {
    expect(() =>
      progressAssessmentSchema.parse({
        grammar: 'Not a score',
        grammarSummary: 'Summary only',
      }),
    ).toThrow('Invalid numeric field: grammar');
  });
});
