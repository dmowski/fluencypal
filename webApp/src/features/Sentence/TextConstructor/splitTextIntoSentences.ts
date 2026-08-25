export const splitTextIntoSentences = (text: string): string[] => {
  if (!text.trim()) {
    return [];
  }

  const normalizedText = text.replace(/\s+/g, ' ').trim();
  // Capture the terminator instead of lookbehind. Safari 15.4–16.3 (in our
  // browserslist) throws SyntaxError: invalid group specifier name on lookbehind.
  const sentenceBoundary =
    /([.!?。！？؟]["”’\)\]》」』】]?)(?=\s*(?:[„"(\[«（「『【]?[\p{Lu}\p{Lt}\p{Lo}\d]))/gu;
  const parts = normalizedText.split(sentenceBoundary);
  const sentences: string[] = [];
  for (let i = 0; i < parts.length; i += 2) {
    const sentence = `${parts[i] ?? ''}${parts[i + 1] ?? ''}`.trim();
    if (sentence) {
      sentences.push(sentence);
    }
  }

  return sentences;
};
