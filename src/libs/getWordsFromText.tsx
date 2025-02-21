type GetWordsFromTextOutput = Record<string, number>;

export const getWordsFromText = (text: string): GetWordsFromTextOutput => {
  const words = text
    .toLowerCase()
    .replace(/[.,!?]/g, "") // Remove punctuation
    .replace(/ \- /g, " ") // Remove punctuation
    .split(/\s+/); // Split by whitespace

  const wordsCount: GetWordsFromTextOutput = {};

  words.forEach((word) => {
    if (word) {
      wordsCount[word] = (wordsCount[word] || 0) + 1;
    }
  });

  return wordsCount;
};
