/** Returns the absolute character start offset of each word within words.join(' '). */
export const getWordCharOffsets = (words: string[]): number[] => {
  const offsets: number[] = [];
  let pos = 0;
  for (const word of words) {
    offsets.push(pos);
    pos += word.length + 1;
  }
  return offsets;
};
