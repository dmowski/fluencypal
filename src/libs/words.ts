export const getWordsCount = (text: string) => {
  return text.trim().split(/\s+/).length;
};
