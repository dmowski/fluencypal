const SHORT_SOURCE_MAX_LENGTH = 80;
const MAX_EXAMPLE_LENGTH = 400;

const normalizeExampleCopy = (value: string): string =>
  value
    .normalize('NFC')
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const withoutTrailingPunctuation = (value: string): string => value.replace(/[.!?…]+$/g, '');

const stripDecorations = (value: string): string => {
  let text = value.replace(/\s+/g, ' ').trim();
  text = text.replace(/^(?:here(?:'s| is)(?: an| a)? (?:example|sentence)[:\s-]*)/i, '').trim();
  text = text.replace(/^(?:example|sentence)\s*\d*\s*[:.)-]\s*/i, '').trim();
  text = text.replace(/^(?:\d+[.)]\s*|[-*•]\s+)/, '').trim();
  text = text.replace(/^["'`«»]+|["'`«»]+$/g, '').trim();
  return text;
};

const SENTENCE_END = /[.!?]/;

/** Split after `.` `!` or `?` plus whitespace, without a lookbehind (Safari 15–16). */
const splitAfterSentencePunctuation = (text: string): string[] => {
  const parts: string[] = [];
  let start = 0;

  for (let index = 0; index < text.length; index += 1) {
    if (!SENTENCE_END.test(text[index] ?? '')) {
      continue;
    }

    let end = index + 1;
    while (end < text.length && SENTENCE_END.test(text[end] ?? '')) {
      end += 1;
    }
    if (end >= text.length || !/\s/.test(text[end] ?? '')) {
      continue;
    }

    parts.push(text.slice(start, end));
    while (end < text.length && /\s/.test(text[end] ?? '')) {
      end += 1;
    }
    start = end;
    index = end - 1;
  }

  if (start < text.length) {
    parts.push(text.slice(start));
  }
  return parts;
};

const containsPhrase = (sentence: string, phrase: string): boolean => {
  if (!phrase) {
    return false;
  }
  if (/\s/.test(phrase)) {
    return sentence.includes(phrase);
  }
  const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}([^\\p{L}\\p{N}]|$)`, 'u').test(sentence);
};

const sentenceContainingPhrase = (text: string, phrase: string): string | null => {
  const parts = splitAfterSentencePunctuation(text)
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length <= 1) {
    return text;
  }
  return parts.find((part) => containsPhrase(normalizeExampleCopy(part), phrase)) ?? null;
};

const firstSentence = (text: string): string => {
  const [sentence] = splitAfterSentencePunctuation(text)
    .map((part) => part.trim())
    .filter(Boolean);
  return sentence || text;
};

/**
 * Keep only sentences that are safe to show: one sentence, not a copy of the
 * source, not a copy of another example, and — for a short word or phrase —
 * actually containing that text.
 */
export const selectUsageExamples = (rawSentences: string[], sourceText: string): string[] => {
  const sourceNormalized = withoutTrailingPunctuation(normalizeExampleCopy(sourceText));
  const requirePhrase =
    sourceNormalized.length > 0 && sourceNormalized.length <= SHORT_SOURCE_MAX_LENGTH;
  const seen = new Set<string>();
  const selected: string[] = [];

  for (const raw of rawSentences) {
    const line = raw
      .split('\n')
      .map((item) => item.trim())
      .find((item) => item.length > 0);
    if (!line) {
      continue;
    }

    const decorated = stripDecorations(line);
    if (!decorated || decorated.startsWith('{') || decorated.startsWith('[')) {
      continue;
    }

    const candidate = requirePhrase
      ? sentenceContainingPhrase(decorated, sourceNormalized)
      : firstSentence(decorated);
    if (!candidate) {
      continue;
    }

    const cleaned = stripDecorations(candidate);
    const normalized = withoutTrailingPunctuation(normalizeExampleCopy(cleaned));
    if (!normalized || normalized === sourceNormalized || seen.has(normalized)) {
      continue;
    }
    if (requirePhrase && !containsPhrase(normalized, sourceNormalized)) {
      continue;
    }
    if (cleaned.length > MAX_EXAMPLE_LENGTH) {
      continue;
    }

    seen.add(normalized);
    selected.push(cleaned);
  }

  return selected;
};
