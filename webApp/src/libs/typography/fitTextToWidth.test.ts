import { fitTextToWidth } from './fitTextToWidth';

describe('fitTextToWidth', () => {
  it('finds the largest size that fits when probe and rendered widths agree', () => {
    const result = fitTextToWidth({
      availableWidth: 122,
      measureCandidateWidth: (fontSizePx) => fontSizePx * 2,
      measureRenderedWidth: (fontSizePx) => fontSizePx * 2,
    });

    expect(result).toBe(60);
  });

  it('shrinks when rendered width still overflows after the initial fit', () => {
    const result = fitTextToWidth({
      availableWidth: 122,
      measureCandidateWidth: (fontSizePx) => fontSizePx * 2,
      measureRenderedWidth: (fontSizePx) => fontSizePx * 2.08,
    });

    expect(result).toBe(57.5);
  });

  it('grows back up when the probe measurement is conservative', () => {
    const result = fitTextToWidth({
      availableWidth: 122,
      measureCandidateWidth: (fontSizePx) => fontSizePx * 2.8,
      measureRenderedWidth: (fontSizePx) => fontSizePx * 2,
    });

    expect(result).toBe(60);
  });

  it('returns undefined when there is no usable width', () => {
    const result = fitTextToWidth({
      availableWidth: 0,
      measureCandidateWidth: (fontSizePx) => fontSizePx * 2,
      measureRenderedWidth: (fontSizePx) => fontSizePx * 2,
    });

    expect(result).toBeUndefined();
  });

  it('grows beyond the old fixed ceiling when width allows it', () => {
    const result = fitTextToWidth({
      availableWidth: 402,
      measureCandidateWidth: (fontSizePx) => fontSizePx * 2,
      measureRenderedWidth: (fontSizePx) => fontSizePx * 2,
    });

    expect(result).toBe(200);
  });
});
