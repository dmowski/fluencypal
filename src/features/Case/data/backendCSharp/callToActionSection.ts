import { CallToActionSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getBackendCallToActionSection = (
  lang: SupportedLanguage,
): CallToActionSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "callToAction",
    title: i18n._("Ready to ace your backend interview?"),
    buttonTitle: i18n._("Start Your Backend Interview Test"),
  };
};
