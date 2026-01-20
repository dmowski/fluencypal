import { getI18nInstance } from "@/appRouterI18n";
import { SupportedLanguage } from "./lang";

export const getLangLearnPlanLabels = (
  lang: SupportedLanguage,
): Record<SupportedLanguage, string> => {
  const i18n = getI18nInstance(lang);
  const labelMap: Record<SupportedLanguage, string> = {
    en: i18n.t("English Learning Plan"),
    es: i18n.t("Spanish Learning Plan"),
    zh: i18n.t("Chinese Learning Plan"),
    fr: i18n.t("French Learning Plan"),
    de: i18n.t("German Learning Plan"),
    ja: i18n.t("Japanese Learning Plan"),
    ko: i18n.t("Korean Learning Plan"),
    ar: i18n.t("Arabic Learning Plan"),
    pt: i18n.t("Portuguese Learning Plan"),

    it: i18n.t("Italian Learning Plan"),
    pl: i18n.t("Polish Learning Plan"),
    ru: i18n.t("Russian Learning Plan"),

    uk: i18n.t("Ukrainian Learning Plan"),
    id: i18n.t("Indonesian Learning Plan"),
    ms: i18n.t("Malay Learning Plan"),
    th: i18n.t("Thai Learning Plan"),
    tr: i18n.t("Turkish Learning Plan"),
    vi: i18n.t("Vietnamese Learning Plan"),
    da: i18n.t("Danish Learning Plan"),
    no: i18n.t("Norwegian Learning Plan"),
    sv: i18n.t("Swedish Learning Plan"),
    be: i18n.t("Belarusian Learning Plan"),
  };

  return labelMap;
};
