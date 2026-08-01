import { TextAiRequest } from '@/features/Ai/types';
import {
  SupportedLanguage,
  fullEnglishLanguageName,
  supportedLanguages,
} from '@/features/Lang/lang';

type TranslateText = (params: TextAiRequest) => Promise<string>;

/** Translates an English category title into every supported language. */
export const translateCategoryTitleToAllLanguages = async (
  titleEn: string,
  translateText: TranslateText,
): Promise<Record<SupportedLanguage, string>> => {
  const title: Record<SupportedLanguage, string> = Object.fromEntries(
    supportedLanguages.map((lang) => [lang, lang === 'en' ? titleEn : '']),
  ) as Record<SupportedLanguage, string>;

  for (const lang of supportedLanguages) {
    if (lang === 'en') continue;
    const langName = fullEnglishLanguageName[lang];
    title[lang] = await translateText({
      systemMessage: `Translate the following category label to ${langName}. Return only the translated text, no explanations.`,
      userMessage: titleEn,
      model: 'gpt-5.6-luna',
    });
  }

  return title;
};
