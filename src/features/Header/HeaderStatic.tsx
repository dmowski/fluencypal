import { HeaderComponentStatic } from "./HeaderComponentStatic";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export function HeaderStatic({ lang }: { lang: SupportedLanguage }) {
  const i18n = getI18nInstance(lang);
  return (
    <HeaderComponentStatic
      lang={lang}
      practiceTitle={i18n._(`Practice`)}
      rolePlayTitle={i18n._(`Role-Plays`)}
      contactsTitle={i18n._(`Contacts`)}
      priceTitle={i18n._(`Price`)}
      signInTitle={i18n._(`Sign In`)}
      balanceTitle={i18n._(`Balance`)}
      needHelpTitle={i18n._(`Need Help?`)}
      logOutTitle={i18n._(`Log Out`)}
      blogTitle={i18n._(`Blog`)}
    />
  );
}
