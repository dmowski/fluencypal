import { FirstScreenSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getFirstScreenSection = (lang: SupportedLanguage): FirstScreenSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "firstScreen",
    title: i18n._("Ace your Senior Frontend Developer interview"),
    subTitle: i18n._(
      "Practice real senior-level frontend interview questions — system design, leadership, and advanced React. Get your personalized interview action plan."
    ),
    label: i18n._("Senior Frontend Developer"),
    buttonTitle: i18n._("Start Your Interview Test"),
  };
};
