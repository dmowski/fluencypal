import { getSafeWordMeta } from './wordIndexSafeMeta';

describe('getSafeWordMeta', () => {
  const words = ['alpha', 'beta'];
  const wordCharOffsets = [0, 6];

  it('returns metadata for in-range word index', () => {
    const result = getSafeWordMeta({
      wordIndex: 1,
      fallbackWord: 'fallback',
      words,
      wordCharOffsets,
    });

    expect(result).toEqual({ sourceWord: 'beta', sourceStart: 6 });
  });

  it('clamps negative index to first word', () => {
    const result = getSafeWordMeta({
      wordIndex: -10,
      fallbackWord: 'fallback',
      words,
      wordCharOffsets,
    });

    expect(result).toEqual({ sourceWord: 'alpha', sourceStart: 0 });
  });

  it('clamps over-bound index to last word', () => {
    const result = getSafeWordMeta({
      wordIndex: 99,
      fallbackWord: 'fallback',
      words,
      wordCharOffsets,
    });

    expect(result).toEqual({ sourceWord: 'beta', sourceStart: 6 });
  });

  it('uses fallback when words list is empty', () => {
    const result = getSafeWordMeta({
      wordIndex: 0,
      fallbackWord: 'fallback',
      words: [],
      wordCharOffsets: [],
    });

    expect(result).toEqual({ sourceWord: 'fallback', sourceStart: 0 });
  });
});
