import { NativeLangCode } from '@/libs/language/type';
import { TranslationPageSettings, TranslationSpeechItem, TranslationTexts } from './types';

export const buildAutoSpeechQueue = ({
  sourceLanguage,
  texts,
  settings,
}: {
  sourceLanguage: NativeLangCode;
  texts: TranslationTexts;
  settings: TranslationPageSettings;
}): TranslationSpeechItem[] => {
  if (!settings.voiceOverEnabled) {
    return [];
  }

  const queue: TranslationSpeechItem[] = [];
  const sourceText = texts[sourceLanguage]?.trim() || '';

  if (settings.autoPronounceSource && sourceText) {
    queue.push({ language: sourceLanguage, text: sourceText });
  }

  if (settings.autoPronounceResult) {
    for (const language of settings.languages) {
      if (language === sourceLanguage) {
        continue;
      }
      const translatedText = texts[language]?.trim() || '';
      if (translatedText) {
        queue.push({ language, text: translatedText });
      }
    }
  }

  return queue;
};
