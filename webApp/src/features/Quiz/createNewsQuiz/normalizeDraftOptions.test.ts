import {
  normalizeDraftOptions,
  resolveCorrectOptionIdFromDraft,
} from './normalizeDraftOptions';

describe('normalizeDraftOptions', () => {
  it('uses isCorrect flags from the draft', () => {
    expect(
      normalizeDraftOptions([
        { label: 'A', isCorrect: false },
        { label: 'B', isCorrect: true },
      ]),
    ).toEqual([
      { label: 'A', isCorrect: false },
      { label: 'B', isCorrect: true },
    ]);
  });

  it('strips option ids and falls back to correctOptionLabel', () => {
    expect(
      normalizeDraftOptions(
        [
          { id: 'legacy-opt-0', label: 'Wrong' },
          { id: 'legacy-opt-1', label: 'Right' },
        ],
        'Right',
      ),
    ).toEqual([
      { label: 'Wrong', isCorrect: false },
      { label: 'Right', isCorrect: true },
    ]);
  });
});

describe('resolveCorrectOptionIdFromDraft', () => {
  it('assigns ids by index and picks the flagged correct option', () => {
    const draft = [
      { label: 'Została uznana za prawdziwą.', isCorrect: false },
      { label: 'Została sfalsyfikowana.', isCorrect: true },
      { label: 'Została potwierdzona.', isCorrect: false },
      { label: 'Została porzucona.', isCorrect: false },
    ];

    expect(resolveCorrectOptionIdFromDraft(draft, 'q-3-1')).toEqual({
      options: [
        { id: 'q-3-1-opt-0', label: 'Została uznana za prawdziwą.' },
        { id: 'q-3-1-opt-1', label: 'Została sfalsyfikowana.' },
        { id: 'q-3-1-opt-2', label: 'Została potwierdzona.' },
        { id: 'q-3-1-opt-3', label: 'Została porzucona.' },
      ],
      correctOptionId: 'q-3-1-opt-1',
    });
  });

  it('rejects drafts without exactly one correct option', () => {
    expect(
      resolveCorrectOptionIdFromDraft(
        [
          { label: 'A', isCorrect: true },
          { label: 'B', isCorrect: true },
        ],
        'q-0-0',
      ),
    ).toBeNull();
  });
});
