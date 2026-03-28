import { clearWordForAudio } from '@/features/Audio/clearWord';
import { splitWords } from '@/features/Sentence/TextConstructor/textConstructor.utils';

export interface ReadingProgress {
  activeMarkdown: string;
  isDone: boolean;
  completionPercentage: number;
}

type TextToken = {
  raw: string;
  start: number;
  end: number;
  normalized: string | null;
};

type LcsMatch = {
  textWordIndex: number;
};

// Arabic vowel diacritics (harakat) — STT engines typically strip these from output.
const arabicDiacritics =
  /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]/g;
const apostropheVariants = /[\u2019\u2018\u02BC\uFF07]/g;

const normalizeForMatching = (word: string): string | null => {
  const cleared = clearWordForAudio(word);
  if (!cleared) return null;

  return cleared.replace(arabicDiacritics, '').replace(apostropheVariants, "'");
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
      normalized: normalizeForMatching(raw),
    });
  }

  return tokens;
};

const getLcsMatches = (textWords: string[], transcriptWords: string[]): LcsMatch[] => {
  const textLength = textWords.length;
  const transcriptLength = transcriptWords.length;

  if (!textLength || !transcriptLength) {
    return [];
  }

  const dp: number[][] = Array.from({ length: textLength + 1 }, () =>
    Array.from({ length: transcriptLength + 1 }, () => 0),
  );

  for (let i = 1; i <= textLength; i += 1) {
    for (let j = 1; j <= transcriptLength; j += 1) {
      if (textWords[i - 1] === transcriptWords[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  const matches: LcsMatch[] = [];
  let textCursor = textLength;
  let transcriptCursor = transcriptLength;

  while (textCursor > 0 && transcriptCursor > 0) {
    if (textWords[textCursor - 1] === transcriptWords[transcriptCursor - 1]) {
      matches.push({
        textWordIndex: textCursor - 1,
      });
      textCursor -= 1;
      transcriptCursor -= 1;
      continue;
    }

    if (dp[textCursor - 1][transcriptCursor] >= dp[textCursor][transcriptCursor - 1]) {
      textCursor -= 1;
    } else {
      transcriptCursor -= 1;
    }
  }

  return matches.reverse();
};

const splitIntoRuns = (matchedTextWordIndices: number[]): Array<[number, number]> => {
  if (!matchedTextWordIndices.length) {
    return [];
  }

  const runs: Array<[number, number]> = [];
  let runStart = matchedTextWordIndices[0];
  let runEnd = matchedTextWordIndices[0];

  for (let index = 1; index < matchedTextWordIndices.length; index += 1) {
    const current = matchedTextWordIndices[index];

    if (current === runEnd + 1) {
      runEnd = current;
      continue;
    }

    runs.push([runStart, runEnd]);
    runStart = current;
    runEnd = current;
  }

  runs.push([runStart, runEnd]);
  return runs;
};

const getWordInventoryCoverageCount = (textWords: string[], transcriptWords: string[]): number => {
  if (!textWords.length || !transcriptWords.length) {
    return 0;
  }

  const transcriptWordCounts = new Map<string, number>();

  for (const word of transcriptWords) {
    transcriptWordCounts.set(word, (transcriptWordCounts.get(word) ?? 0) + 1);
  }

  let matchedCount = 0;

  for (const word of textWords) {
    const count = transcriptWordCounts.get(word) ?? 0;
    if (count <= 0) continue;

    matchedCount += 1;
    transcriptWordCounts.set(word, count - 1);
  }

  return matchedCount;
};

const renderRunsMarkdown = (
  fullText: string,
  tokens: TextToken[],
  textWordToTokenIndex: number[],
  runs: Array<[number, number]>,
): string => {
  if (!runs.length) {
    return fullText;
  }

  let cursor = 0;
  let result = '';

  for (const [runStart, runEnd] of runs) {
    const startTokenIndex = textWordToTokenIndex[runStart];
    const endTokenIndex = textWordToTokenIndex[runEnd];

    const startOffset = tokens[startTokenIndex]?.start ?? 0;
    const endOffset = tokens[endTokenIndex]?.end ?? 0;

    result += fullText.slice(cursor, startOffset);
    result += `*${fullText.slice(startOffset, endOffset)}*`;
    cursor = endOffset;
  }

  result += fullText.slice(cursor);
  return result;
};

export const getReadingProgress = (fullText: string, transcript: string): ReadingProgress => {
  if (!transcript || transcript.trim() === '') {
    return {
      activeMarkdown: fullText,
      isDone: false,
      completionPercentage: 0,
    };
  }

  const textTokens = tokenizeText(fullText);
  const textWordToTokenIndex: number[] = [];
  const textWords: string[] = [];

  for (let tokenIndex = 0; tokenIndex < textTokens.length; tokenIndex += 1) {
    const normalized = textTokens[tokenIndex].normalized;
    if (!normalized) continue;

    textWords.push(normalized);
    textWordToTokenIndex.push(tokenIndex);
  }

  const transcriptWords = splitWords(transcript)
    .map((word) => normalizeForMatching(word))
    .filter((word): word is string => Boolean(word));

  const lcsMatches = getLcsMatches(textWords, transcriptWords);
  const matchedWordCount = lcsMatches.length;

  if (matchedWordCount === 0) {
    return {
      activeMarkdown: fullText,
      isDone: false,
      completionPercentage: 0,
    };
  }

  // Keep UX predictable: we only show progress after the user starts from the beginning.
  if (lcsMatches[0].textWordIndex !== 0) {
    return {
      activeMarkdown: fullText,
      isDone: false,
      completionPercentage: 0,
    };
  }

  const matchedTextWordIndices = lcsMatches.map((match) => match.textWordIndex);
  const runs = splitIntoRuns(matchedTextWordIndices);

  const lcsHighlightedWordCount = runs.reduce(
    (count, [start, end]) => count + (end - start + 1),
    0,
  );
  const inventoryCoverageCount = getWordInventoryCoverageCount(textWords, transcriptWords);
  const highlightedWordCount = Math.max(lcsHighlightedWordCount, inventoryCoverageCount);
  const completionPercentage =
    textWords.length > 0 ? Math.round((highlightedWordCount / textWords.length) * 100) : 0;
  const isDone = completionPercentage > 50;

  const activeMarkdown =
    completionPercentage === 100
      ? `*${fullText}*`
      : renderRunsMarkdown(fullText, textTokens, textWordToTokenIndex, runs);

  return {
    activeMarkdown,
    isDone,
    completionPercentage,
  };
};
