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
});
