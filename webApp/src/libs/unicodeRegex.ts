/**
 * Build a Unicode-property regex from a string pattern, never a regex literal.
 *
 * Safari 15.4–16.3 (our browserslist) throws
 * `SyntaxError: Invalid regular expression: invalid group specifier name`
 * on lookbehind. SWC can compile Unicode letter/number property literals
 * back into lookbehind, which crashes `/quiz` and `/practice` as soon as
 * the chunk is parsed (DARK-LANG-DF). `new RegExp` leaves the pattern for
 * the browser, which already supports Unicode properties.
 */
export const compileUnicodeRegex = (source: string, flags: string): RegExp =>
  new RegExp(source, flags);

export const LETTER_OR_NUMBER_CHAR_REGEX = compileUnicodeRegex('[\\p{L}\\p{N}]', 'u');
export const LETTER_OR_NUMBER_RUN_REGEX = compileUnicodeRegex('[\\p{L}\\p{N}]+', 'gu');
export const LEADING_NON_LETTER_OR_NUMBER_REGEX = compileUnicodeRegex('^[^\\p{L}\\p{N}]+', 'u');
export const TRAILING_NON_LETTER_OR_NUMBER_REGEX = compileUnicodeRegex('[^\\p{L}\\p{N}]+$', 'u');
export const NON_WORD_NON_DECORATOR_CHAR_REGEX = compileUnicodeRegex('[^\\p{L}\\p{N}*_]', 'u');

export const matchLetterOrNumberRuns = (text: string): string[] | null => {
  LETTER_OR_NUMBER_RUN_REGEX.lastIndex = 0;
  return text.match(LETTER_OR_NUMBER_RUN_REGEX);
};
