import type { Metadata } from "next";
import { supportedLanguages } from "@/features/Lang/lang";
import { initLingui } from "@/initLingui";
import { generateMetadataInfo } from "@/libs/metadata";
import { PracticeProvider } from "@/app/practiceProvider";
import { QuizPage } from "@/features/Goal/QuizPage";

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
    currentPath: "quiz2",
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
    <PracticeProvider>
      <QuizPage lang={supportedLang} defaultLangToLearn={languageToLearn} />
    </PracticeProvider>
  );
}
