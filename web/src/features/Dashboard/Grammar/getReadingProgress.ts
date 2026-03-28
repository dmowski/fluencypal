import { clearWordForAudio } from '@/features/Audio/clearWord';
import { splitWords } from '@/features/Sentence/TextConstructor/textConstructor.utils';

export interface ReadingProgress {
  activeMarkdown: string;
  isDone: boolean;
}

type TextToken = {
  raw: string;
  start: number;
  end: number;
  normalized: string | null;
};

const tokenizeText = (text: string): TextToken[] => {
  const tokens: TextToken[] = [];

  for (const match of text.matchAll(/\S+/g)) {
    const raw = match[0];
    const start = match.index ?? 0;

    tokens.push({
      raw,
      start,
      end: start + raw.length,
      normalized: clearWordForAudio(raw),
    });
  }

  return tokens;
};

const countMatchedWords = (textWords: string[], transcriptWords: string[]): number => {
  if (!textWords.length || !transcriptWords.length) {
    return 0;
  }

  let transcriptIndex = 0;
  let matched = 0;

  for (const textWord of textWords) {
    while (
      transcriptIndex < transcriptWords.length &&
      transcriptWords[transcriptIndex] !== textWord
    ) {
      transcriptIndex += 1;
    }

    if (transcriptIndex >= transcriptWords.length) {
      break;
    }

    matched += 1;
    transcriptIndex += 1;
  }

  return matched;
};

const getPrefixEnd = (tokens: TextToken[], matchedWordCount: number): number => {
  if (matchedWordCount <= 0) {
    return 0;
  }

  let normalizedCount = 0;

  for (const token of tokens) {
    if (!token.normalized) {
      continue;
    }

    normalizedCount += 1;

    if (normalizedCount === matchedWordCount) {
      return token.end;
    }
  }

  return tokens[tokens.length - 1]?.end ?? 0;
};

export const getReadingProgress = (fullText: string, transcript: string): ReadingProgress => {
  if (!transcript || transcript.trim() === '') {
    return {
      activeMarkdown: fullText,
      isDone: false,
    };
  }

  const textTokens = tokenizeText(fullText);
  const textWords = textTokens
    .map((token) => token.normalized)
    .filter((word): word is string => Boolean(word));
  const transcriptWords = splitWords(transcript)
    .map((word) => clearWordForAudio(word))
    .filter((word): word is string => Boolean(word));

  const matchedWordCount = countMatchedWords(textWords, transcriptWords);
  const isDone = textWords.length > 0 && matchedWordCount === textWords.length;

  if (matchedWordCount === 0) {
    return {
      activeMarkdown: fullText,
      isDone,
    };
  }

  const prefixEnd = getPrefixEnd(textTokens, matchedWordCount);
  const prefix = fullText.slice(0, prefixEnd);
  const suffix = fullText.slice(prefixEnd);

  return {
    activeMarkdown: `*${prefix}*${suffix}`,
    isDone,
  };
};
