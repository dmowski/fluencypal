export const getSafeWordMeta = ({
  wordIndex,
  fallbackWord,
  words,
  wordCharOffsets,
}: {
  wordIndex: number;
  fallbackWord: string;
  words: string[];
  wordCharOffsets: number[];
}): {
  sourceWord: string;
  sourceStart: number;
} => {
  const lastSafeIndex = Math.max(words.length - 1, 0);
  const safeIndex = Math.min(Math.max(wordIndex, 0), lastSafeIndex);
  const sourceWord = words[safeIndex] ?? fallbackWord;
  const sourceStart = wordCharOffsets[safeIndex] ?? 0;

  return {
    sourceWord,
    sourceStart,
  };
};
