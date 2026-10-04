import { toPublicSchedule } from './publicSchedule';

describe('toPublicSchedule', () => {
  const now = new Date('2026-10-04T12:00:00.000Z');

  it('keeps upcoming time, language, and join count', () => {
    const calls = toPublicSchedule(
      [
        {
          id: 'tue',
          startsAtIso: '2026-10-06T16:00:00.000Z',
          status: 'scheduled',
          languageCode: 'en',
          joinCount: 6.9,
        },
      ],
      now,
    );

    expect(calls).toEqual([
      {
        id: 'tue',
        startsAtIso: '2026-10-06T16:00:00.000Z',
        languageCode: 'en',
        joinCount: 6,
      },
    ]);
  });

  it('drops meet links, stopped calls, and calls that already ended', () => {
    const calls = toPublicSchedule(
      [
        {
          id: 'old',
          startsAtIso: '2026-10-01T16:00:00.000Z',
          status: 'scheduled',
          languageCode: 'en',
          joinCount: 2,
        },
        {
          id: 'stopped',
          startsAtIso: '2026-10-06T16:00:00.000Z',
          status: 'stopped',
          languageCode: 'en',
          joinCount: 1,
        },
        {
          id: 'es',
          startsAtIso: '2026-10-07T16:00:00.000Z',
          status: 'scheduled',
          languageCode: 'not-a-language',
          joinCount: -3,
        },
      ],
      now,
    );

    expect(calls).toEqual([
      {
        id: 'es',
        startsAtIso: '2026-10-07T16:00:00.000Z',
        languageCode: 'en',
        joinCount: 0,
      },
    ]);
    expect(JSON.stringify(calls)).not.toContain('meet');
    expect(JSON.stringify(calls)).not.toContain('link');
  });
});
