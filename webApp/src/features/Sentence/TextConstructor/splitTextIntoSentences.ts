const TERMINATORS = '.!?。！？؟';
const CLOSING_AFTER_TERMINATOR = '"”’\')]}》」』】';
const OPENING_BEFORE_SENTENCE = '„"([«（「『【';

const isSentenceStartChar = (ch: string): boolean => {
  if (!ch) return false;
  if (ch >= '0' && ch <= '9') return true;

  const upper = ch.toUpperCase();
  const lower = ch.toLowerCase();
  if (upper !== lower) return ch === upper;

  const code = ch.codePointAt(0) ?? 0;
  return (
    (code >= 0x0370 && code <= 0x03ff) ||
    (code >= 0x0400 && code <= 0x052f) ||
    (code >= 0x0590 && code <= 0x05ff) ||
    (code >= 0x0600 && code <= 0x06ff) ||
    (code >= 0x0750 && code <= 0x077f) ||
    (code >= 0x08a0 && code <= 0x08ff) ||
    (code >= 0x0900 && code <= 0x097f) ||
    (code >= 0x0e00 && code <= 0x0e7f) ||
    (code >= 0x3040 && code <= 0x30ff) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0xac00 && code <= 0xd7af) ||
    (code >= 0xff66 && code <= 0xff9d)
  );
};

const looksLikeNextSentence = (text: string, fromIndex: number): boolean => {
  let i = fromIndex;
  while (i < text.length && /\s/.test(text[i] ?? '')) i += 1;
  if (i < text.length && OPENING_BEFORE_SENTENCE.includes(text[i] ?? '')) i += 1;
  const next = text[i];
  return !!next && isSentenceStartChar(next);
};

export const splitTextIntoSentences = (text: string): string[] => {
  if (!text.trim()) {
    return [];
  }

  const normalizedText = text.replace(/\s+/g, ' ').trim();
  // Walk terminators in JS. Safari 15.4–16.3 throws SyntaxError on lookbehind,
  // and Unicode property regexes can be compiled back into lookbehind.
  const sentences: string[] = [];
  let start = 0;

  for (let i = 0; i < normalizedText.length; i += 1) {
    const ch = normalizedText[i] ?? '';
    if (!TERMINATORS.includes(ch)) continue;

    let end = i + 1;
    if (
      end < normalizedText.length &&
      CLOSING_AFTER_TERMINATOR.includes(normalizedText[end] ?? '')
    ) {
      end += 1;
    }

    if (!looksLikeNextSentence(normalizedText, end)) {
      i = end - 1;
      continue;
    }

    const sentence = normalizedText.slice(start, end).trim();
    if (sentence) sentences.push(sentence);
    start = end;
    i = end - 1;
  }

  const tail = normalizedText.slice(start).trim();
  if (tail) sentences.push(tail);
  return sentences;
};
