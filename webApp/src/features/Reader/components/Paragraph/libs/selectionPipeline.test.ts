import { buildParagraphTokenMap } from './paragraphTokenMap';
import {
  rangeToHighlightOffsets,
  reconcileSelection,
  type RawSelectionRange,
} from './selectionPipeline';

const buildMap = (words: string[]) => buildParagraphTokenMap(words);

describe('reconcileSelection', () => {
  it('returns null for empty selection text', () => {
    const map = buildMap(['hello', 'world']);
    const raw: RawSelectionRange = { startInclusive: 0, endExclusive: 0, text: '' };
    expect(reconcileSelection(raw, map)).toBeNull();
  });

  it('passes through a correct range unchanged', () => {
    const map = buildMap(['hello', 'world']);
    const raw: RawSelectionRange = { startInclusive: 0, endExclusive: 5, text: 'hello' };
    expect(reconcileSelection(raw, map)).toEqual({
      startInclusive: 0,
      endExclusive: 5,
      text: 'hello',
    });
  });

  it('locates the nearest occurrence when raw offsets drift', () => {
    const map = buildMap(['hi', 'there', 'hi', 'again']);
    // paragraphText = 'hi there hi again'; second 'hi' starts at 9.
    const raw: RawSelectionRange = { startInclusive: 8, endExclusive: 10, text: 'hi' };
    expect(reconcileSelection(raw, map)).toEqual({
      startInclusive: 9,
      endExclusive: 11,
      text: 'hi',
    });
  });

  it('falls back to first occurrence when raw offsets are nullish but exposed as zero-width', () => {
    const map = buildMap(['needle', 'in', 'a', 'needle', 'stack']);
    const raw: RawSelectionRange = { startInclusive: 0, endExclusive: 6, text: 'needle' };
    expect(reconcileSelection(raw, map)).toEqual({
      startInclusive: 0,
      endExclusive: 6,
      text: 'needle',
    });
  });

  it('handles multi-word phrases', () => {
    const map = buildMap(['Whenever', 'you', 'feel', 'like', 'criticizing']);
    const raw: RawSelectionRange = {
      startInclusive: 9,
      endExclusive: 17,
      text: 'you feel',
    };
    expect(reconcileSelection(raw, map)).toEqual({
      startInclusive: 9,
      endExclusive: 17,
      text: 'you feel',
    });
  });
});

describe('rangeToHighlightOffsets', () => {
  it('converts exclusive end to inclusive endIndex and adds paragraph offset', () => {
    expect(rangeToHighlightOffsets({ startInclusive: 3, endExclusive: 8 }, 100)).toEqual({
      startIndex: 103,
      endIndex: 107,
    });
  });

  it('handles a single-character range', () => {
    expect(rangeToHighlightOffsets({ startInclusive: 0, endExclusive: 1 }, 0)).toEqual({
      startIndex: 0,
      endIndex: 0,
    });
  });
});
