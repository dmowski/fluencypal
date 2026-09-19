import { MARKDOWN_EMPHASIS_SPAN_REGEX } from './markdownEmphasis';

/**
 * When `splitIntoPages` slices a single source paragraph into multiple page
 * chunks, a markdown emphasis span (e.g. `_word word_` or `**word**`) can be
 * cut in half — the opener ends up on page N and its matching closer on page
 * N+1. Each chunk is then handed to `markdown-to-jsx` in isolation, where
 * the unmatched delimiter is rendered as a literal `_` / `*` instead of
 * applying italic/bold formatting.
 *
 * This module detects emphasis spans that straddle a chunk boundary and
 * returns the wrapper delimiters that must be re-injected at render time to
 * keep markdown balanced for each chunk WITHOUT modifying the chunk's
 * `words` array (which is the source of truth for selection char offsets).
 *
 * Care: a bare `_` between alphanumerics (`foo_bar`) is intraword and is
 * NOT an emphasis delimiter in CommonMark; we mirror the same word-boundary
 * gating that `hasMarkdownEmphasis` uses so literal underscores are never
 * miscounted.
 */

export interface EmphasisSpan {
  marker: '_' | '__' | '*' | '**';
  openStart: number;
  closeEndExclusive: number;
}

export interface MarkdownChunkWrappers {
  markdownPrefix: string;
  markdownSuffix: string;
}

const detectMarker = (matchedSpan: string): EmphasisSpan['marker'] => {
  if (matchedSpan.startsWith('**')) return '**';
  if (matchedSpan.startsWith('__')) return '__';
  if (matchedSpan.startsWith('*')) return '*';
  return '_';
};

export const findEmphasisSpans = (text: string): EmphasisSpan[] => {
  const spans: EmphasisSpan[] = [];
  MARKDOWN_EMPHASIS_SPAN_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = MARKDOWN_EMPHASIS_SPAN_REGEX.exec(text)) !== null) {
    const leadingContextLength = match[1].length;
    const spanText = match[2];
    const openStart = match.index + leadingContextLength;
    const closeEndExclusive = openStart + spanText.length;
    spans.push({
      marker: detectMarker(spanText),
      openStart,
      closeEndExclusive,
    });
    // Resume scanning AFTER the matched span (the regex consumed the trailing
    // context via look-ahead so `lastIndex` is already at `closeEndExclusive`,
    // but we set it explicitly to make the contract clear).
    MARKDOWN_EMPHASIS_SPAN_REGEX.lastIndex = closeEndExclusive;
  }

  return spans;
};

/**
 * Compute the delimiters that must be PREPENDED / APPENDED to the rendered
 * markdown for a chunk that covers `[chunkStart, chunkEndExclusive)` of the
 * original paragraph text.
 *
 * - If an emphasis span opens BEFORE the chunk and closes INSIDE it, prepend
 *   the opener so `markdown-to-jsx` sees a complete pair.
 * - If an emphasis span opens INSIDE the chunk and closes AFTER it, append
 *   the closer so `markdown-to-jsx` sees a complete pair.
 *
 * The returned wrappers are concatenated in span order so nested / multiple
 * crossings are handled deterministically.
 */
export const getMarkdownWrappersForChunk = ({
  originalParagraphText,
  chunkStart,
  chunkEndExclusive,
}: {
  originalParagraphText: string;
  chunkStart: number;
  chunkEndExclusive: number;
}): MarkdownChunkWrappers => {
  if (chunkStart === 0 && chunkEndExclusive >= originalParagraphText.length) {
    return { markdownPrefix: '', markdownSuffix: '' };
  }

  const spans = findEmphasisSpans(originalParagraphText);
  let markdownPrefix = '';
  let markdownSuffix = '';

  for (const span of spans) {
    const opensBeforeChunk = span.openStart < chunkStart;
    const opensInsideChunk = span.openStart >= chunkStart && span.openStart < chunkEndExclusive;
    const closesAfterChunk = span.closeEndExclusive > chunkEndExclusive;
    const closesInsideChunk =
      span.closeEndExclusive > chunkStart && span.closeEndExclusive <= chunkEndExclusive;

    if (opensBeforeChunk && closesInsideChunk) {
      markdownPrefix += span.marker;
    } else if (opensInsideChunk && closesAfterChunk) {
      markdownSuffix += span.marker;
    }
  }

  return { markdownPrefix, markdownSuffix };
};
