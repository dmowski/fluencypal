import { TextListSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getBackendWhoIsThisForSection = (lang: SupportedLanguage): TextListSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "textList",
    title: i18n._("Who this is for"),
    subTitle: i18n._("Designed for experienced backend engineers"),
    textList: [
      { title: i18n._("C# Backend Developers preparing for new roles or promotions") },
      { title: i18n._("Engineers interviewing for Senior, Lead, or Staff backend positions") },
      { title: i18n._(".NET specialists facing API, data, and system design rounds") },
      { title: i18n._("Developers moving from mid-level to senior with stronger stories") },
      { title: i18n._("Candidates targeting product companies with distributed backends") },
      { title: i18n._("Engineers confident in basics but improving architectural reasoning") },
    ],
  };
};
