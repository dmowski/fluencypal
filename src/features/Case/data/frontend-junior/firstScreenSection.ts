import { FirstScreenSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getFirstScreenSection = (lang: SupportedLanguage): FirstScreenSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "firstScreen",
    title: i18n._("Mock Frontend Interviews with AI to Land Your First Dev Job"),
    subTitle: i18n._(
      "Practice real junior frontend interviews, build confidence, and master the fundamentals to start your career."
    ),
    label: i18n._("Junior Frontend Developer"),
    buttonTitle: i18n._("Start Your Interview Test"),
  };
};
