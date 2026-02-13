export const splitTextIntoSentences = (text: string): string[] => {
  if (!text.trim()) {
    return [];
  }

  const normalizedText = text.replace(/\s+/g, ' ').trim();
  const sentenceBoundary = /(?<=[.!?]["”’)\]]?)\s+(?=(?:[„"(\[]?[\p{Lu}\d]))/gu;
  const sentences = normalizedText.split(sentenceBoundary).map((sentence) => sentence.trim()).filter(Boolean);

  return sentences;
};
