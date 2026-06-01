import { countNewsReadsLast24h } from './countNewsReadsLast24h';
import { NewsStat } from './types';

describe('countNewsReadsLast24h', () => {
  const now = new Date('2026-06-01T12:00:00.000Z');

  it('counts views within the last 24 hours across all news stats', () => {
    const stats: NewsStat[] = [
      {
        viewsUserIds: {
          u1: '2026-06-01T11:00:00.000Z',
          u2: '2026-05-31T13:00:00.000Z',
        },
        updatedAtIso: '2026-06-01T11:00:00.000Z',
      },
      {
        viewsUserIds: {
          u3: '2026-06-01T00:00:00.000Z',
          u4: '2026-05-30T00:00:00.000Z',
        },
        updatedAtIso: '2026-06-01T00:00:00.000Z',
      },
    ];

    expect(countNewsReadsLast24h(stats, now)).toBe(3);
  });

  it('returns zero when no views fall within the window', () => {
    const stats: NewsStat[] = [
      {
        viewsUserIds: {
          u1: '2026-05-29T00:00:00.000Z',
        },
        updatedAtIso: '2026-05-29T00:00:00.000Z',
      },
    ];

    expect(countNewsReadsLast24h(stats, now)).toBe(0);
  });
});
