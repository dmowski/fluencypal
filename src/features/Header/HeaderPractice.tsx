import { HeaderComponent, HeaderMode } from "./HeaderComponent";
import { SupportedLanguage } from "@/common/lang";
import { getI18nInstance } from "@/appRouterI18n";

export function HeaderPractice({ lang }: { lang: SupportedLanguage }) {
  const i18n = getI18nInstance(lang);
  return (
    <HeaderComponent
      mode="practice"
      lang={lang}
      practiceTitle={i18n._(`Practice`)}
      rolePlayTitle={i18n._(`Role-Plays`)}
      contactsTitle={i18n._(`Contacts`)}
      priceTitle={i18n._(`Price`)}
      signInTitle={i18n._(`Join`)}
      balanceTitle={i18n._(`Balance`)}
      needHelpTitle={i18n._(`Need Help?`)}
      logOutTitle={i18n._(`Log Out`)}
      blogTitle={i18n._(`Blog`)}
    />
  );
}
