import { fullLanguageName, SupportedLanguage } from '@/features/Lang/lang';

export const buildQuizTargetLanguageInstruction = (targetLanguageCode: string): string => {
  const languageName =
    fullLanguageName[targetLanguageCode as SupportedLanguage] || targetLanguageCode;

  return `The learner is studying ${languageName} (${targetLanguageCode}). Write all learner-facing explanation and feedback in ${languageName}. Do not use English unless the target language is English.`;
};
