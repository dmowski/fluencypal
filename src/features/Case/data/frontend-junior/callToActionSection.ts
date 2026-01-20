import { CallToActionSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getCallToActionSection = (
  lang: SupportedLanguage,
): CallToActionSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "callToAction",
    title: i18n._("Ready to ace your next interview?"),
    buttonTitle: i18n._("Start Your Interview Test"),
  };
};
