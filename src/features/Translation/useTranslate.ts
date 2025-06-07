import { translateRequest } from "@/app/api/translate/translateRequest";
import { useSettings } from "../Settings/useSettings";
import { getPageLangCode, SupportedLanguage } from "../Lang/lang";
import { usePlan } from "../Plan/usePlan";

const translationCache: Record<string, string> = {};
export const useTranslate = () => {
  const settings = useSettings();
  const plan = usePlan();

  const pageLangCode = getPageLangCode();
  const learningLanguage = settings.languageCode || "en";

  const planNativeLanguage = plan.latestGoal?.goalQuiz?.nativeLanguageCode;

  const targetLanguage = pageLangCode !== learningLanguage ? pageLangCode : planNativeLanguage;

  const isTranslateAvailable = targetLanguage && targetLanguage !== learningLanguage;

  const translateText = async ({ text }: { text: string }) => {
    if (!targetLanguage) {
      return "";
    }

    if (translationCache[text]) {
      return translationCache[text];
    }
    // todo: add words to the dictionary to learn

    const response = await translateRequest({
      text,
      sourceLanguage: learningLanguage,
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
