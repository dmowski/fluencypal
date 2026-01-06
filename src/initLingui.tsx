import { setI18n } from "@lingui/react/server";
import { getI18nInstance } from "./appRouterI18n";
import { supportedLanguages } from "./features/Lang/lang";
import { initDayJsLocale } from "./features/Lang/dayJsLang";

export type PageLangParam = {
  params: Promise<{ lang: string }>;
};

export function initLingui(lang: string) {
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  const i18n = getI18nInstance(supportedLang);
  setI18n(i18n);
  initDayJsLocale(supportedLang);
  return i18n;
}
