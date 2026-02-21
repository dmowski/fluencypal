export type ActiveSentencePart = {
  sentenceIndex: number;
  activeSentence: string;
  activeTranslation: string;
  activeSentenceWords: string[];
  completedWordsInSentence: number;
  nextWord: string;
};

export const splitWords = (text: string): string[] => {
  if (!text.trim()) {
    return [];
  }

  return text.trim().split(/\s+/).filter(Boolean);
};

const normalizeWord = (word: string): string => {
  return word
    .toLocaleLowerCase()
    .replace(/^[^\p{L}\p{N}]+/u, '')
    .replace(/[^\p{L}\p{N}]+$/u, '');
};

export const getActiveSentencePart = ({
  sentences,
  sentencesTranslates,
  progress,
}: {
  sentences: string[];
  sentencesTranslates: string[];
  progress: string;
}): ActiveSentencePart | null => {
  if (!sentences.length) {
    return null;
  }

  const progressWords = splitWords(progress);
  let progressCursor = 0;

  for (let sentenceIndex = 0; sentenceIndex < sentences.length; sentenceIndex += 1) {
    const activeSentence = sentences[sentenceIndex] ?? '';
    const activeSentenceWords = splitWords(activeSentence);
    let completedWordsInSentence = 0;

    while (
      completedWordsInSentence < activeSentenceWords.length &&
      progressCursor < progressWords.length
    ) {
      const expectedWord = activeSentenceWords[completedWordsInSentence];
      const currentWord = progressWords[progressCursor];

      if (normalizeWord(currentWord) !== normalizeWord(expectedWord)) {
        break;
      }

      completedWordsInSentence += 1;
      progressCursor += 1;
    }

    if (completedWordsInSentence < activeSentenceWords.length) {
      return {
        sentenceIndex,
        activeSentence,
        activeTranslation: sentencesTranslates[sentenceIndex] ?? '',
        activeSentenceWords,
        completedWordsInSentence,
        nextWord: activeSentenceWords[completedWordsInSentence],
      };
    }
  }

  return null;
};

const shuffleWords = (words: string[], random: () => number): string[] => {
  const shuffled = [...words];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

export const generateRandomWordOptions = ({
  activeSentenceWords,
  completedWordsInSentence,
  correctWord,
  optionsCount = 6,
  random = Math.random,
}: {
  activeSentenceWords: string[];
  completedWordsInSentence: number;
  correctWord: string;
  optionsCount?: number;
  random?: () => number;
}): string[] => {
  const remainingWords = activeSentenceWords.slice(completedWordsInSentence);
  const uniqueWords = Array.from(new Set(remainingWords.filter((word) => word.trim())));
  const fallbackWords = uniqueWords.filter((word) => word !== correctWord);
  const distractors = shuffleWords(fallbackWords, random).slice(0, Math.max(optionsCount - 1, 0));
  const options = shuffleWords(Array.from(new Set([...distractors, correctWord])), random).slice(
    0,
    optionsCount,
  );

  return options;
};

export const constructFinalProgress = ({
  progress,
  nextWord,
}: {
  progress: string;
  nextWord: string;
}): string => {
  return [progress.trim(), nextWord.trim()].filter(Boolean).join(' ');
};
