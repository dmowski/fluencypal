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
              options: [
                { label: 'cześć', isCorrect: true },
                { label: 'dobry', isCorrect: false },
              ],
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
    expect(result.sections[0].questions[0].options).toEqual([
      { label: 'cześć', isCorrect: true },
      { label: 'dobry', isCorrect: false },
    ]);
  });

  it('migrates legacy correctOptionLabel and strips option ids', () => {
    const raw = {
      meta: { title: 'Quiz' },
      sections: [
        {
          type: 'listening',
          title: 'Listening',
          questions: [
            {
              audioText: 'Test audio',
              questionText: 'Test question?',
              options: [
                { id: 'legacy-0', label: 'Wrong' },
                { id: 'legacy-1', label: 'Right' },
              ],
              correctOptionLabel: 'Right',
            },
          ],
        },
      ],
      examEvaluation: { instruction: 'Summarize.' },
    };

    const result = preprocessNewsQuizDraft(raw) as typeof raw;
    expect(result.sections[0].questions[0].options).toEqual([
      { label: 'Wrong', isCorrect: false },
      { label: 'Right', isCorrect: true },
    ]);
    expect(result.sections[0].questions[0]).not.toHaveProperty('correctOptionLabel');
  });
});
