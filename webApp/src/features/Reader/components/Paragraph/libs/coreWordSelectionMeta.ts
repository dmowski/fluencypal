/**
 * Returns the alphanumeric "core" of a rendered word along with the offsets
 * (within the raw word) where the core starts and ends. Used to trim leading
 * and trailing punctuation when a single rendered token contains both a word
 * and its trailing punctuation (e.g. plain-text `criticizing,`).
 *
 * If the word has no alphanumeric chars at all (pure punctuation token), the
 * full raw word is returned.
 */
export const getCoreWordSelectionMeta = (
  rawWord: string,
): { normalizedWord: string; startOffset: number; endOffsetExclusive: number } => {
  let startOffset = 0;
  let endOffsetExclusive = rawWord.length;

  while (startOffset < endOffsetExclusive && !/[\p{L}\p{N}]/u.test(rawWord[startOffset])) {
    startOffset += 1;
  }

  while (
    endOffsetExclusive > startOffset &&
    !/[\p{L}\p{N}]/u.test(rawWord[endOffsetExclusive - 1])
  ) {
    endOffsetExclusive -= 1;
  }

  if (startOffset === endOffsetExclusive) {
    return {
      normalizedWord: rawWord,
      startOffset: 0,
      endOffsetExclusive: rawWord.length,
    };
  }

  return {
    normalizedWord: rawWord.slice(startOffset, endOffsetExclusive),
    startOffset,
    endOffsetExclusive,
  };
};
