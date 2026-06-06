import { countQuizCompletionsLast24h } from './countQuizCompletionsLast24h';
import { QuizStat } from './types';

describe('countQuizCompletionsLast24h', () => {
  const now = new Date('2026-06-01T12:00:00.000Z');

  it('counts completions within the last 24 hours', () => {
    const stats: QuizStat[] = [
      {
        completionsUserIds: {
          u1: '2026-06-01T11:00:00.000Z',
          u2: '2026-05-30T12:00:00.000Z',
        },
        updatedAtIso: '2026-06-01T11:00:00.000Z',
      },
      {
        completionsUserIds: {
          u3: '2026-06-01T10:30:00.000Z',
        },
        updatedAtIso: '2026-06-01T10:30:00.000Z',
      },
    ];

    expect(countQuizCompletionsLast24h(stats, now)).toBe(2);
  });
});
