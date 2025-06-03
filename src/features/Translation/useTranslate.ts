import { translateRequest } from "@/app/api/translate/translateRequest";
import { useSettings } from "../Settings/useSettings";
import { getPageLangCode } from "../Lang/lang";

export const useTranslate = () => {
  const settings = useSettings();
  const targetLanguage = getPageLangCode();

  console.log(" targetLanguage", targetLanguage);
  const translateText = async ({ text }: { text: string }) => {
    // todo: add words to the dictionary to learn

    const targetLanguage = getPageLangCode();

    const response = await translateRequest({
      text,
      sourceLanguage: settings.languageCode || "en",
      targetLanguage,
    });
    return response.translatedText;
  };

  return {
    translateText,
  };
};
