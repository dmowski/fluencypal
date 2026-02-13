export const splitTextIntoSentences = (text: string): string[] => {
  if (!text.trim()) {
    return [];
  }

  const normalizedText = text.replace(/\s+/g, ' ').trim();
  const sentenceMatches = normalizedText.match(/[^.!?]+(?:[.!?]+(?=\s|$)|$)/g);

  if (!sentenceMatches) {
    return [normalizedText];
  }

  return sentenceMatches.map((sentence) => sentence.trim()).filter(Boolean);
};
