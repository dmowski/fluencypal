import { compileUnicodeRegex } from '@/libs/unicodeRegex';

/**
 * Complete, well-formed markdown emphasis with CommonMark word-boundary
 * gating (`foo_bar_baz` is not an emphasis pair). Built via `new RegExp`
 * so SWC cannot compile Unicode properties into Safari-breaking lookbehind.
 */
const MARKDOWN_EMPHASIS_PATTERN =
  '(^|[^\\p{L}\\p{N}_*])((\\*\\*[^*\\n](?:[^*\\n]*[^*\\n])?\\*\\*)|(\\*[^*\\n]+\\*)|(__[^_\\n](?:[^_\\n]*[^_\\n])?__)|(_[^_\\n]+_))(?=$|[^\\p{L}\\p{N}_*])';

export const MARKDOWN_EMPHASIS_TEST_REGEX = compileUnicodeRegex(MARKDOWN_EMPHASIS_PATTERN, 'u');
export const MARKDOWN_EMPHASIS_SPAN_REGEX = compileUnicodeRegex(MARKDOWN_EMPHASIS_PATTERN, 'gu');

export const hasMarkdownEmphasis = (text: string): boolean => {
  return MARKDOWN_EMPHASIS_TEST_REGEX.test(text);
};
