import { getCoreWordSelectionMeta } from './coreWordSelectionMeta';

describe('getCoreWordSelectionMeta', () => {
  it('returns the same word when there is no surrounding punctuation', () => {
    expect(getCoreWordSelectionMeta('hello')).toEqual({
      normalizedWord: 'hello',
      startOffset: 0,
      endOffsetExclusive: 5,
    });
  });

  it('strips trailing punctuation', () => {
    expect(getCoreWordSelectionMeta('criticizing,')).toEqual({
      normalizedWord: 'criticizing',
      startOffset: 0,
      endOffsetExclusive: 11,
    });
  });

  it('strips leading and trailing punctuation', () => {
    expect(getCoreWordSelectionMeta('"Quoted!"')).toEqual({
      normalizedWord: 'Quoted',
      startOffset: 1,
      endOffsetExclusive: 7,
    });
  });

  it('returns the raw word when it is pure punctuation', () => {
    expect(getCoreWordSelectionMeta(',')).toEqual({
      normalizedWord: ',',
      startOffset: 0,
      endOffsetExclusive: 1,
    });
  });

  it('keeps unicode letters and digits', () => {
    expect(getCoreWordSelectionMeta('“crítico123,”')).toEqual({
      normalizedWord: 'crítico123',
      startOffset: 1,
      endOffsetExclusive: 11,
    });
  });
});
