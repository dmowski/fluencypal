export const getWordsCount = (text: string) => {
  const cleanedText = text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '').trim();
  if (!cleanedText) {
    return 0;
  }
  return cleanedText.split(/\s+/).length;
};
