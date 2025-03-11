import { allMessages } from "@/appRouterI18n";
import LandingPage from "@/features/Landing/LandingPage";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";
import { initLingui } from "@/initLingui";

export default function Home() {
  const lang = "en";
  initLingui(lang);
  return (
    <LinguiClientProvider initialLocale={lang} initialMessages={allMessages[lang]!}>
      <LandingPage lang={lang} />
    </LinguiClientProvider>
  );
}
