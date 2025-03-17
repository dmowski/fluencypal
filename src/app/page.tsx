import { allMessages } from "@/appRouterI18n";
import LandingPage from "@/features/Landing/LandingPage";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";
import { initLingui } from "@/initLingui";

export default function Home() {
  const supportedLang = "en";
  initLingui(supportedLang);
  return (
    <LinguiClientProvider
      initialLocale={supportedLang}
      initialMessages={allMessages[supportedLang]!}
    >
      <LandingPage lang={supportedLang} />
    </LinguiClientProvider>
  );
}
