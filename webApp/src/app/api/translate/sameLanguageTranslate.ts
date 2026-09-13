export const areTranslateLanguagesEqual = (
  sourceLanguage: string | null | undefined,
  targetLanguage: string | null | undefined,
): boolean => {
  if (!sourceLanguage || !targetLanguage) {
    return false;
  }

  return sourceLanguage.split('-')[0].toLowerCase() === targetLanguage.split('-')[0].toLowerCase();
};

export const isSameLanguageTranslateError = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
  return /Target language can't be equal to source language/i.test(message);
};
