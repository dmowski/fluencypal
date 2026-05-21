/**
 * Pure builder for the per-paragraph rendered token map (Phase 1, read-only).
 *
 * For now this is computed and memoized but NOT consumed by the renderer.
 * It is the future single source of truth for the
 *   "rendered token → source character range" mapping.
 *
 * Invariants:
 * - The concatenation of token source ranges covers every character of
 *   `paragraphText = words.join(' ')` exactly once (no gaps, no overlap).
 * - `tokens` are ordered by ascending `sourceStart`.
 * - `word` tokens carry the matching `words[]` index.
 */

export type RenderedToken =
  | {
      kind: 'word';
      text: string;
      sourceStart: number;
      sourceEndExclusive: number;
      wordIndex: number;
    }
  | {
      kind: 'space';
      sourceStart: number;
      sourceEndExclusive: number;
    }
  | {
      kind: 'decorator';
      markdownChars: string;
      sourceStart: number;
      sourceEndExclusive: number;
    }
  | {
      kind: 'link' | 'image';
      raw: string;
      visibleText: string;
      href: string;
      sourceStart: number;
      sourceEndExclusive: number;
      wordIndex: number;
    };

export interface ParagraphTokenMap {
  paragraphText: string;
  words: string[];
  tokens: RenderedToken[];
  tokenAtSourceOffset: (offset: number) => RenderedToken | null;
  sourceRangeForRenderedSlice: (
    renderedStart: number,
    renderedEnd: number,
  ) => { sourceStart: number; sourceEndExclusive: number } | null;
}

const DECORATOR_CHAR_REGEX = /[*_]/;
const WORD_CHAR_REGEX = /[\p{L}\p{N}]/u;
const NON_WORD_NON_DECORATOR_REGEX = /[^\p{L}\p{N}*_]/u;

const LINK_OR_IMAGE_REGEX = /^(!?)\[([^\]]*)\]\(([^)]*)\)$/u;

const computeWordCharOffsets = (words: string[]): number[] => {
  const offsets: number[] = [];
  let cursor = 0;
  for (let i = 0; i < words.length; i += 1) {
    offsets.push(cursor);
    cursor += words[i].length + 1;
  }
  return offsets;
};

const findLeadingDecoratorLength = (rawWord: string): number => {
  let length = 0;
  while (length < rawWord.length && DECORATOR_CHAR_REGEX.test(rawWord[length])) {
    length += 1;
  }
  return length;
};

const findTrailingPunctuationLength = (rawWord: string, leadingDecoratorLength: number): number => {
  let length = 0;
  while (
    leadingDecoratorLength + length < rawWord.length &&
    NON_WORD_NON_DECORATOR_REGEX.test(rawWord[rawWord.length - 1 - length])
  ) {
    length += 1;
  }
  return length;
};

const findTrailingDecoratorLength = (
  rawWord: string,
  leadingDecoratorLength: number,
  trailingPunctuationLength: number,
): number => {
  let length = 0;
  const decoratorWindowEndExclusive = rawWord.length - trailingPunctuationLength;
  while (
    decoratorWindowEndExclusive - 1 - length >= leadingDecoratorLength &&
    DECORATOR_CHAR_REGEX.test(rawWord[decoratorWindowEndExclusive - 1 - length])
  ) {
    length += 1;
  }
  return length;
};

const tryEmitLinkOrImageToken = (
  rawWord: string,
  wordSourceStart: number,
  wordIndex: number,
): RenderedToken | null => {
  const match = rawWord.match(LINK_OR_IMAGE_REGEX);
  if (!match) {
    return null;
  }
  const [raw, prefix, visibleText, href] = match;
  return {
    kind: prefix === '!' ? 'image' : 'link',
    raw,
    visibleText,
    href,
    sourceStart: wordSourceStart,
    sourceEndExclusive: wordSourceStart + rawWord.length,
    wordIndex,
  };
};

const tokenizeWord = (
  rawWord: string,
  wordSourceStart: number,
  wordIndex: number,
): RenderedToken[] => {
  if (rawWord.length === 0) {
    return [];
  }

  const linkOrImage = tryEmitLinkOrImageToken(rawWord, wordSourceStart, wordIndex);
  if (linkOrImage) {
    return [linkOrImage];
  }

  const leadingDecoratorLength = findLeadingDecoratorLength(rawWord);
  const rawTrailingPunctuationLength = findTrailingPunctuationLength(
    rawWord,
    leadingDecoratorLength,
  );
  const trailingDecoratorLength = findTrailingDecoratorLength(
    rawWord,
    leadingDecoratorLength,
    rawTrailingPunctuationLength,
  );

  // When a source word has a leading decorator but NO matching trailing
  // decorator (e.g. `**Finally,` whose closing `**` is on the next source
  // word), the markdown renderer folds the trailing punctuation into the
  // inner word — "Finally," becomes one rendered word, not two.  Emitting a
  // separate trailing-punctuation token for that case would shift every
  // subsequent renderableToken index by one, breaking the wordIndex ↔ token
  // mapping used by renderWord.  So we keep the punctuation merged with the
  // inner word when the decorator is "open" (leading only, no trailing close).
  const trailingPunctuationLength =
    leadingDecoratorLength > 0 && trailingDecoratorLength === 0 ? 0 : rawTrailingPunctuationLength;

  // Markdown emphasis decorators are stripped by the renderer. The split into
  // multiple rendered tokens happens whenever ANY decorator is present on the
  // source word (open and/or close, possibly spanning multiple source words).
  // A bare word with no decorators (e.g. `anyone,`) renders as a single token.
  if (leadingDecoratorLength === 0 && trailingDecoratorLength === 0) {
    return [
      {
        kind: 'word',
        text: rawWord,
        sourceStart: wordSourceStart,
        sourceEndExclusive: wordSourceStart + rawWord.length,
        wordIndex,
      },
    ];
  }

  const innerWordStart = leadingDecoratorLength;
  const innerWordEnd = rawWord.length - trailingPunctuationLength - trailingDecoratorLength;

  const tokens: RenderedToken[] = [];

  if (leadingDecoratorLength > 0) {
    tokens.push({
      kind: 'decorator',
      markdownChars: rawWord.slice(0, leadingDecoratorLength),
      sourceStart: wordSourceStart,
      sourceEndExclusive: wordSourceStart + leadingDecoratorLength,
    });
  }

  if (innerWordEnd > innerWordStart) {
    tokens.push({
      kind: 'word',
      text: rawWord.slice(innerWordStart, innerWordEnd),
      sourceStart: wordSourceStart + innerWordStart,
      sourceEndExclusive: wordSourceStart + innerWordEnd,
      wordIndex,
    });
  }

  if (trailingDecoratorLength > 0) {
    tokens.push({
      kind: 'decorator',
      markdownChars: rawWord.slice(innerWordEnd, innerWordEnd + trailingDecoratorLength),
      sourceStart: wordSourceStart + innerWordEnd,
      sourceEndExclusive: wordSourceStart + innerWordEnd + trailingDecoratorLength,
    });
  }

  if (trailingPunctuationLength > 0) {
    const punctStart = innerWordEnd + trailingDecoratorLength;
    tokens.push({
      kind: 'word',
      text: rawWord.slice(punctStart),
      sourceStart: wordSourceStart + punctStart,
      sourceEndExclusive: wordSourceStart + rawWord.length,
      wordIndex,
    });
  }

  // No letters/digits at all (e.g. a stray "—" or "***"): emit a single covering token
  // so we never leave gaps in source coverage.
  if (tokens.length === 0) {
    tokens.push(
      WORD_CHAR_REGEX.test(rawWord)
        ? {
            kind: 'word',
            text: rawWord,
            sourceStart: wordSourceStart,
            sourceEndExclusive: wordSourceStart + rawWord.length,
            wordIndex,
          }
        : {
            kind: 'decorator',
            markdownChars: rawWord,
            sourceStart: wordSourceStart,
            sourceEndExclusive: wordSourceStart + rawWord.length,
          },
    );
  }

  return tokens;
};

export const buildParagraphTokenMap = (words: string[]): ParagraphTokenMap => {
  const paragraphText = words.join(' ');
  const wordOffsets = computeWordCharOffsets(words);
  const tokens: RenderedToken[] = [];

  for (let wi = 0; wi < words.length; wi += 1) {
    const word = words[wi];
    const wordSourceStart = wordOffsets[wi];

    tokens.push(...tokenizeWord(word, wordSourceStart, wi));

    if (wi < words.length - 1) {
      const spaceStart = wordSourceStart + word.length;
      tokens.push({
        kind: 'space',
        sourceStart: spaceStart,
        sourceEndExclusive: spaceStart + 1,
      });
    }
  }

  const tokenAtSourceOffset = (offset: number): RenderedToken | null => {
    if (offset < 0 || offset >= paragraphText.length) {
      return null;
    }
    // Tokens are ordered & non-overlapping; a linear scan is fine for paragraph sizes.
    for (let i = 0; i < tokens.length; i += 1) {
      const token = tokens[i];
      if (offset >= token.sourceStart && offset < token.sourceEndExclusive) {
        return token;
      }
    }
    return null;
  };

  const sourceRangeForRenderedSlice = (
    renderedStart: number,
    renderedEnd: number,
  ): { sourceStart: number; sourceEndExclusive: number } | null => {
    if (renderedEnd <= renderedStart) {
      return null;
    }
    const startToken = tokenAtSourceOffset(renderedStart);
    const endToken = tokenAtSourceOffset(Math.max(renderedStart, renderedEnd - 1));
    if (!startToken || !endToken) {
      return null;
    }
    return {
      sourceStart: startToken.sourceStart,
      sourceEndExclusive: endToken.sourceEndExclusive,
    };
  };

  return {
    paragraphText,
    words,
    tokens,
    tokenAtSourceOffset,
    sourceRangeForRenderedSlice,
  };
};

/**
 * Asserts the token map covers every char of paragraphText exactly once,
 * tokens are in monotonic order, and word tokens point to valid wordIndex values.
 *
 * Returns null when no violation is found, or a structured violation reason.
 */
export const validateParagraphTokenMap = (map: ParagraphTokenMap): string | null => {
  const { tokens, paragraphText, words } = map;
  let cursor = 0;
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.sourceStart !== cursor) {
      return `gap-or-overlap-at-token-${i}: expected sourceStart=${cursor}, got ${token.sourceStart}`;
    }
    if (token.sourceEndExclusive <= token.sourceStart) {
      return `empty-token-at-${i}`;
    }
    if (token.kind === 'word' || token.kind === 'link' || token.kind === 'image') {
      if (token.wordIndex < 0 || token.wordIndex >= words.length) {
        return `bad-wordIndex-${token.wordIndex}-at-${i}`;
      }
    }
    cursor = token.sourceEndExclusive;
  }
  if (cursor !== paragraphText.length) {
    return `incomplete-coverage: cursor=${cursor}, paragraphText.length=${paragraphText.length}`;
  }
  return null;
};
