import { Suspense } from "react";

import { HeaderComponent, HeaderMode } from "./HeaderComponent";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export function Header({ mode, lang }: { mode: HeaderMode; lang: SupportedLanguage }) {
  const i18n = getI18nInstance(lang);
  return (
    <Suspense>
      <HeaderComponent
        mode={mode}
        lang={lang}
        practiceTitle={i18n._(`Practice`)}
        rolePlayTitle={i18n._(`Role-Plays`)}
        contactsTitle={i18n._(`Contacts`)}
        priceTitle={i18n._(`Price`)}
        signInTitle={i18n._(`Sign In`)}
        balanceTitle={i18n._(`Balance`)}
        needHelpTitle={i18n._(`Need Help?`)}
        logOutTitle={i18n._(`Log Out`)}
      />
    </Suspense>
  );
}
