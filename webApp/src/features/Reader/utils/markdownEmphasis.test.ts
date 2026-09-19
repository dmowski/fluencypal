import { hasMarkdownEmphasis } from './markdownEmphasis';
import { findEmphasisSpans } from './balanceMarkdownAcrossSplit';

describe('markdownEmphasis', () => {
  it('detects paired emphasis and ignores intraword underscores', () => {
    expect(hasMarkdownEmphasis('_hello_')).toBe(true);
    expect(hasMarkdownEmphasis('**hello**')).toBe(true);
    expect(hasMarkdownEmphasis('__hello__')).toBe(true);
    expect(hasMarkdownEmphasis('*hello*')).toBe(true);
    expect(hasMarkdownEmphasis('foo_bar_baz')).toBe(false);
    expect(hasMarkdownEmphasis('plain text')).toBe(false);
  });

  it('finds the same spans used to rebalance page splits', () => {
    expect(findEmphasisSpans('See _one two_ now')).toEqual([
      { marker: '_', openStart: 4, closeEndExclusive: 13 },
    ]);
    expect(findEmphasisSpans('foo_bar_baz')).toEqual([]);
  });
});
