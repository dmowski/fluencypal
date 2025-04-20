import type { Metadata } from "next";
import { ContactsPage } from "@/features/Landing/Contact/ContactsPage";
import { supportedLanguages } from "@/features/Lang/lang";
import { initLingui } from "@/initLingui";
import { allMessages } from "@/appRouterI18n";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";
import { generateMetadataInfo } from "@/libs/metadata";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return generateMetadataInfo({
    lang: "en",
    currentPath: "contacts",
  });
}

export default async function Page(props: { params: Promise<{ lang: string }> }) {
  const lang = (await props.params).lang;

  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);

  return (
    <LinguiClientProvider
      initialLocale={supportedLang}
      initialMessages={allMessages[supportedLang]!}
    >
      <ContactsPage lang={supportedLang} />
    </LinguiClientProvider>
  );
}
