import type { Metadata } from "next";
import { supportedLanguages } from "@/features/Lang/lang";
import { initLingui } from "@/initLingui";
import { allMessages } from "@/appRouterI18n";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";
import { generateMetadataInfo } from "@/libs/metadata";
import { TgAppPage } from "@/features/TgApp/TgAppPage";
import { PracticeProvider } from "@/app/practiceProvider";

export async function generateStaticParams() {
  return supportedLanguages.map((lang: string) => ({ lang }));
}

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    learn?: string;
  }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const searchParam = await props.searchParams;
  const toLearn = searchParam.learn || "";
  const languageToLearn = supportedLanguages.find((l) => l === toLearn) || "en";
  return generateMetadataInfo({
    lang: (await props.params).lang,
    currentPath: "tg-app",
    languageToLearn,
  });
}

export default async function Page(props: PageProps) {
  const lang = (await props.params).lang;

  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);

  const searchParam = await props.searchParams;
  const toLearn = searchParam.learn || "";
  const languageToLearn = supportedLanguages.find((l) => l === toLearn) || "en";

  return (
    <LinguiClientProvider
      initialLocale={supportedLang}
      initialMessages={allMessages[supportedLang]!}
    >
      <PracticeProvider>
        <TgAppPage lang={supportedLang} defaultLangToLearn={languageToLearn} />
      </PracticeProvider>
    </LinguiClientProvider>
  );
}
