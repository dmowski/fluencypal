const SENTENCE_PART_REGEX =
  /[^.!?]+(?:[.!?]+(?=\s|$|[\u201C\u201D\u2018\u2019"'')\]}])[\u201C\u201D\u2018\u2019"'')\]}]*|$)\s*/g;

/**
 * Splits prose into sentence-sized chunks for per-sentence UI affordances.
 * Falls back to the whole string when splitting would drop characters
 * (e.g. a period immediately followed by a closing quote).
 */
export const splitIntoSentenceParts = (text: string): string[] => {
  const parts = text.match(SENTENCE_PART_REGEX) || [text];
  if (parts.join('') !== text) {
    return [text];
  }
  return parts;
};
