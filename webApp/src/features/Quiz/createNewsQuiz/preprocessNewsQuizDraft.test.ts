import { preprocessNewsQuizDraft, normalizeSectionType } from './newsQuizSchema';

describe('normalizeSectionType', () => {
  it('accepts canonical section types', () => {
    expect(normalizeSectionType('fill-gap')).toBe('fill-gap');
  });

  it('maps common aliases', () => {
    expect(normalizeSectionType('Vocabulary')).toBe('word-translation');
    expect(normalizeSectionType('grammar')).toBe('fill-gap');
  });
});

describe('preprocessNewsQuizDraft', () => {
  it('strips per-question type and keeps section type', () => {
    const raw = {
      meta: { title: 'Quiz' },
      sections: [
        {
          type: 'vocabulary',
          title: 'Vocabulary',
          questions: [
            {
              type: 'multiple-choice',
              promptText: 'hello',
              direction: 'target-to-native',
              options: [{ label: 'cześć' }, { label: 'dobry' }],
              correctOptionLabel: 'cześć',
            },
          ],
        },
      ],
      examEvaluation: { instruction: 'Summarize.' },
    };

    const result = preprocessNewsQuizDraft(raw) as typeof raw;
    expect(result.sections[0].type).toBe('word-translation');
    expect(result.sections[0].questions[0]).not.toHaveProperty('type');
    expect(result.sections[0].questions[0].promptText).toBe('hello');
  });
});
