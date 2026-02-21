const symbolsToRemove = [
  '.',
  ',',
  '!',
  '?',
  '“',
  '”',
  '"',
  "'",
  '(',
  ')',
  '[',
  ']',
  '{',
  '„',
  '}',
  ':',
  ';',
  '/',
  '\\',
  '|',
  '@',
  '#',
  '$',
  '%',
  '^',
  '&',
  '*',
  '+',
  '=',
  '<',
  '>',
  '~',
  '`',
  ',”',
  '-',
  '…',
];

export const clearWordForAudio = (word: string): string | null => {
  let processedWord = word.trim().toLowerCase();

  symbolsToRemove.forEach((symbol) => {
    if (processedWord.startsWith(symbol)) {
      processedWord = processedWord.slice(1);
    }
    if (processedWord.endsWith(symbol)) {
      processedWord = processedWord.slice(0, -1);
    }
  });

  symbolsToRemove.forEach((symbol) => {
    if (processedWord.startsWith(symbol)) {
      processedWord = processedWord.slice(1);
    }

    if (processedWord.endsWith(symbol)) {
      processedWord = processedWord.slice(0, -1);
    }
  });

  return processedWord || null;
};
