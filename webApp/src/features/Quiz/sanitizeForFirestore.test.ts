import { sanitizeForFirestore } from './sanitizeForFirestore';

describe('sanitizeForFirestore', () => {
  it('removes undefined fields at any depth', () => {
    const input = {
      meta: {
        title: 'Quiz',
        description: undefined,
        nested: { keep: 'yes', drop: undefined },
      },
      list: [{ ok: 1, missing: undefined }],
    };

    expect(sanitizeForFirestore(input)).toEqual({
      meta: {
        title: 'Quiz',
        nested: { keep: 'yes' },
      },
      list: [{ ok: 1 }],
    });
  });

  it('preserves null values', () => {
    expect(sanitizeForFirestore({ nativeLanguageCode: null })).toEqual({
      nativeLanguageCode: null,
    });
  });
});
