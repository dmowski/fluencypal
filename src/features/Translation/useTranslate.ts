import { translateRequest } from "@/app/api/translate/translateRequest";
import { useSettings } from "../Settings/useSettings";
import { getPageLangCode } from "../Lang/lang";

const translationCache: Record<string, string> = {};
export const useTranslate = () => {
  const settings = useSettings();

  const targetLanguage = getPageLangCode();

  const isTranslateAvailable = targetLanguage !== settings.languageCode;

  console.log(" targetLanguage", targetLanguage);
  const translateText = async ({ text }: { text: string }) => {
    if (translationCache[text]) {
      return translationCache[text];
    }
    // todo: add words to the dictionary to learn

    const targetLanguage = getPageLangCode();

    const response = await translateRequest({
      text,
      sourceLanguage: settings.languageCode || "en",
      targetLanguage,
    });
    translationCache[text] = response.translatedText;
    return response.translatedText;
  };

  return {
    translateText,
    isTranslateAvailable,
  };
};
