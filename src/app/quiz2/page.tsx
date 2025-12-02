import type { Metadata } from "next";
import { supportedLanguages } from "@/features/Lang/lang";
import { generateMetadataInfo } from "@/features/SEO/metadata";
import { PracticeProvider } from "@/app/practiceProvider";
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
    currentPath: "quiz2",
    languageToLearn,
  });
}

export default async function Page(props: PageProps) {
  const lang = (await props.params).lang;

  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";

  const searchParam = await props.searchParams;
  const toLearn = searchParam.learn || "";
  const languageToLearn = supportedLanguages.find((l) => l === toLearn) || "en";

  return (
    <html lang={supportedLang}>
      <body>
        <PracticeProvider>
          <QuizPage lang={supportedLang} defaultLangToLearn={languageToLearn} />
        </PracticeProvider>
      </body>
    </html>
  );
}
