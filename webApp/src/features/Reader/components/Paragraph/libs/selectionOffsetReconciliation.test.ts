import { reconcileSelectionOffsets } from './selectionOffsetReconciliation';

describe('reconcileSelectionOffsets', () => {
  it('keeps exact offsets when extracted text already matches', () => {
    const paragraphText = 'I have never found this insight';
    const result = reconcileSelectionOffsets({
      paragraphText,
      selectedText: 'never',
      rawStart: 7,
      rawEnd: 12,
    });

    expect(result).toEqual({ startInclusive: 7, endExclusive: 12 });
  });

  it('shrinks expanded raw range to selected substring inside a word', () => {
    const paragraphText = 'I understood that already';
    const rawStart = paragraphText.indexOf('understood');
    const rawEnd = rawStart + 'understood'.length;

    const result = reconcileSelectionOffsets({
      paragraphText,
      selectedText: 'stood',
      rawStart,
      rawEnd,
    });

    const expectedStart = paragraphText.indexOf('stood');
    expect(result).toEqual({
      startInclusive: expectedStart,
      endExclusive: expectedStart + 'stood'.length,
    });
  });

  it('chooses the nearest duplicate occurrence to the anchor start', () => {
    const paragraphText = 'I have never found what I shall ever find elsewhere.';

    const result = reconcileSelectionOffsets({
      paragraphText,
      selectedText: 'ever',
      rawStart: paragraphText.indexOf('shall ever'),
      rawEnd: paragraphText.indexOf('shall ever') + 'ever'.length,
    });

    const nearestStart = paragraphText.indexOf('ever', paragraphText.indexOf('shall ever'));
    expect(result).toEqual({
      startInclusive: nearestStart,
      endExclusive: nearestStart + 'ever'.length,
    });
  });

  it('falls back to first text occurrence when DOM offsets are missing', () => {
    const paragraphText = 'Whenever you feel this, note it.';

    const result = reconcileSelectionOffsets({
      paragraphText,
      selectedText: 'henever you fee',
      rawStart: null,
      rawEnd: null,
    });

    const expectedStart = paragraphText.indexOf('henever you fee');
    expect(result).toEqual({
      startInclusive: expectedStart,
      endExclusive: expectedStart + 'henever you fee'.length,
    });
  });

  it('returns null for empty normalized selection', () => {
    const result = reconcileSelectionOffsets({
      paragraphText: 'abc',
      selectedText: '   ',
      rawStart: 0,
      rawEnd: 1,
    });

    expect(result).toBeNull();
  });

  it('clamps end to paragraphText length when raw end exceeds it', () => {
    const paragraphText = 'short text';
    const result = reconcileSelectionOffsets({
      paragraphText,
      selectedText: 'text',
      rawStart: 6,
      rawEnd: 999,
    });

    expect(result).toEqual({ startInclusive: 6, endExclusive: 10 });
  });

  it('returns a range of selectedText length anchored near rawStart when selectedText is not present in paragraphText', () => {
    const paragraphText = 'I have never found this insight';
    const result = reconcileSelectionOffsets({
      paragraphText,
      selectedText: 'absent',
      rawStart: 2,
      rawEnd: 5,
    });

    // Implementation expands end to start + selectedLength when no match exists.
    expect(result).toEqual({ startInclusive: 2, endExclusive: 8 });
  });

  it('locates selectedText when only raw start is wildly off but text appears once', () => {
    const paragraphText = 'Whenever you feel like criticizing anyone';
    const result = reconcileSelectionOffsets({
      paragraphText,
      selectedText: 'criticizing',
      rawStart: 0,
      rawEnd: 11,
    });

    const expectedStart = paragraphText.indexOf('criticizing');
    expect(result).toEqual({
      startInclusive: expectedStart,
      endExclusive: expectedStart + 'criticizing'.length,
    });
  });

  it('handles single-character selection', () => {
    const paragraphText = 'a b c d';
    const result = reconcileSelectionOffsets({
      paragraphText,
      selectedText: 'c',
      rawStart: 4,
      rawEnd: 5,
    });

    expect(result).toEqual({ startInclusive: 4, endExclusive: 5 });
  });

  it('preserves trailing punctuation when contained in selectedText', () => {
    const paragraphText = 'remember, darling, the rule';
    const result = reconcileSelectionOffsets({
      paragraphText,
      selectedText: 'remember,',
      rawStart: 0,
      rawEnd: 9,
    });

    expect(result).toEqual({ startInclusive: 0, endExclusive: 9 });
  });

  it('falls back to text search and clamps end when raw offsets are null and text near end', () => {
    const paragraphText = 'abc def ghi';
    const result = reconcileSelectionOffsets({
      paragraphText,
      selectedText: 'ghi',
      rawStart: null,
      rawEnd: null,
    });

    expect(result).toEqual({ startInclusive: 8, endExclusive: 11 });
  });
});
