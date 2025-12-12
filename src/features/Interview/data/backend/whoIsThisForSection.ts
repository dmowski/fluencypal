import { WhoIsThisForSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getBackendWhoIsThisForSection = (lang: SupportedLanguage): WhoIsThisForSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "whoIsThisFor",
    title: i18n._("Who this is for"),
    subTitle: i18n._("Designed for experienced backend engineers"),
    audienceItems: [
      i18n._("C# Backend Developers preparing for new roles or promotions"),
      i18n._("Engineers interviewing for Senior, Lead, or Staff backend positions"),
      i18n._(".NET specialists facing API, data, and system design rounds"),
      i18n._("Developers moving from mid-level to senior with stronger stories"),
      i18n._("Candidates targeting product companies with distributed backends"),
      i18n._("Engineers confident in basics but improving architectural reasoning"),
    ],
  };
};
