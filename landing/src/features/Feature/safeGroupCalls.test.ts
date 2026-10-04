import { toSafeGroupCalls } from './safeGroupCalls';

describe('toSafeGroupCalls', () => {
  it('keeps time, language, and how many people joined', () => {
    expect(
      toSafeGroupCalls({
        calls: [
          {
            id: 'tue',
            startsAtIso: '2026-10-06T16:00:00.000Z',
            languageCode: 'en',
            joinCount: 4,
            link: 'https://meet.google.com/secret',
            email: 'learner@example.com',
          },
        ],
      }),
    ).toEqual([
      {
        id: 'tue',
        startsAtIso: '2026-10-06T16:00:00.000Z',
        languageCode: 'en',
        joinCount: 4,
      },
    ]);
  });

  it('drops rows that are not a real call', () => {
    expect(
      toSafeGroupCalls({
        calls: [
          { id: 'bad', startsAtIso: 'Tuesday 6pm', languageCode: 'en', joinCount: 1 },
          { startsAtIso: '2026-10-06T16:00:00.000Z', languageCode: 'en', joinCount: 1 },
          null,
        ],
      }),
    ).toEqual([]);
  });
});
