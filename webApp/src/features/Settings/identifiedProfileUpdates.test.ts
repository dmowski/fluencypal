import { getIdentifiedProfileUpdates } from './identifiedProfileUpdates';

describe('getIdentifiedProfileUpdates', () => {
  it('backfills empty settings after Google link', () => {
    expect(
      getIdentifiedProfileUpdates({
        existing: { email: null, photoUrl: null, displayName: null },
        authEmail: 'ada@example.com',
        photoUrl: 'https://example.com/a.png',
        displayName: 'Ada',
      }),
    ).toEqual({
      email: 'ada@example.com',
      photoUrl: 'https://example.com/a.png',
      displayName: 'Ada',
    });
  });

  it('skips fields that already match', () => {
    expect(
      getIdentifiedProfileUpdates({
        existing: {
          email: 'ada@example.com',
          photoUrl: 'https://example.com/a.png',
          displayName: 'Ada',
        },
        authEmail: 'ada@example.com',
        photoUrl: 'https://example.com/a.png',
        displayName: 'Ada',
      }),
    ).toEqual({});
  });

  it('ignores empty auth profile fields', () => {
    expect(
      getIdentifiedProfileUpdates({
        existing: { email: null, photoUrl: null, displayName: null },
        authEmail: null,
        photoUrl: '',
        displayName: '',
      }),
    ).toEqual({});
  });
});
