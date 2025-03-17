import { allMessages, getI18nInstance } from "@/appRouterI18n";
import LandingPage from "@/features/Landing/LandingPage";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";
import { CookiesPopup } from "@/features/Legal/CookiesPopup";
import { initLingui } from "@/initLingui";

export default function Home() {
  const supportedLang = "en";
  initLingui(supportedLang);
  const i18n = getI18nInstance(supportedLang);
  return (
    <LinguiClientProvider
      initialLocale={supportedLang}
      initialMessages={allMessages[supportedLang]!}
    >
      <LandingPage lang={supportedLang} />
      <CookiesPopup
        message={i18n._(
          `We use cookies to ensure that we give you the best experience on our website. If you continue to use this site we will assume that you are happy with it`
        )}
        ok={i18n._("Ok")}
        no={i18n._("No")}
        privacy={i18n._("Privacy Policy")}
        lang={supportedLang}
      />
    </LinguiClientProvider>
  );
}
