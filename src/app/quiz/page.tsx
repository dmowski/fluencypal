import type { Metadata } from "next";
import { supportedLanguages } from "@/features/Lang/lang";
import { initLingui } from "@/initLingui";
import { allMessages } from "@/appRouterI18n";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";
import { generateMetadataInfo } from "@/libs/metadata";
import { QuizPage } from "@/features/Goal/QuizPage";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    learn?: string;
  }>;
}
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const searchParam = await props.searchParams;
  const toLearn = searchParam.learn || "";
  const languageToLearn = supportedLanguages.find((l) => l === toLearn) || "en";
  return generateMetadataInfo({
    lang: "en",
    currentPath: "quiz",
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
      <QuizPage lang={supportedLang} defaultLangToLearn={languageToLearn} />
    </LinguiClientProvider>
  );
}
