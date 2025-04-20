import { allMessages } from "@/appRouterI18n";
import { supportedLanguages } from "@/features/Lang/lang";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";
import { TermsOfUse } from "@/features/Legal/TermsOfUse";
import { initLingui } from "@/initLingui";
import { Metadata } from "next";
import { generateMetadataInfo } from "@/libs/metadata";
import { Footer } from "@/features/Landing/Footer";
import { HeaderStatic } from "@/features/Header/HeaderStatic";

export async function generateStaticParams() {
  return supportedLanguages.map((lang: string) => ({ lang }));
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return generateMetadataInfo({
    lang: (await props.params).lang,
    currentPath: "terms",
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
      <HeaderStatic lang={supportedLang} />
      <TermsOfUse lang={supportedLang} />
      <Footer lang={supportedLang} />
    </LinguiClientProvider>
  );
}
