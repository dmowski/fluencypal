import { supportedLanguages } from "@/features/Lang/lang";
import NotFound from "../not-found";
import { initLingui } from "@/initLingui";
import { allMessages } from "@/appRouterI18n";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";

export default async function Page(props: {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}) {
  const params = await props.params;
  const lang = params.lang;
  const supportedLang = supportedLanguages.find((l) => l === lang);
  if (!supportedLang) {
    return <NotFound />;
  }

  initLingui(supportedLang);

  return (
    <html lang={supportedLang}>
      <LinguiClientProvider
        initialLocale={supportedLang}
        initialMessages={allMessages[supportedLang]!}
      >
        {props.children}
      </LinguiClientProvider>
    </html>
  );
}
