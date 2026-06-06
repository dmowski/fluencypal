import { buildFillGapQuestion, buildMcOptions } from './examQuizBuilders';

describe('examQuizBuilders', () => {
  it('assigns option ids by index and marks the correct answer', () => {
    expect(
      buildMcOptions('q-1-0', [
        { label: 'Wrong' },
        { label: 'Right', correct: true },
      ]),
    ).toEqual({
      options: [
        { id: 'q-1-0-opt-0', label: 'Wrong' },
        { id: 'q-1-0-opt-1', label: 'Right' },
      ],
      correctOptionId: 'q-1-0-opt-1',
    });
  });

  it('normalizes fill-gap ids from gap keys', () => {
    const result = buildFillGapQuestion(
      'q-2-0',
      [
        { kind: 'text', text: 'If I ' },
        { kind: 'gap', gapId: 'g1' },
        { kind: 'text', text: ' harder, I would pass.' },
      ],
      {
        g1: [
          { label: 'study' },
          { label: 'studied', correct: true },
        ],
      },
    );

    expect(result.segments[1]).toEqual({ kind: 'gap', gapId: 'q-2-0-gap-g1' });
    expect(result.gaps['q-2-0-gap-g1']?.correctOptionId).toBe('q-2-0-gap-g1-opt-1');
  });
});
