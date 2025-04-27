import type { Metadata } from "next";
import { supportedLanguages } from "@/features/Lang/lang";
import { initLingui } from "@/initLingui";
import { allMessages } from "@/appRouterI18n";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";
import { generateMetadataInfo } from "@/libs/metadata";
import { BlogsPage } from "@/features/Blog/BlogsPage";

export async function generateStaticParams() {
  return [];
}

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    category?: string;
  }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const searchParam = await props.searchParams;
  const category = searchParam.category || "";

  return generateMetadataInfo({
    lang: (await props.params).lang,
    currentPath: "blog",
    category,
  });
}

interface BlogPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
  params: Promise<{ lang: string }>;
}
export default async function BlogFullPage(props: BlogPageProps) {
  const params = await props.searchParams;
  const category = params.category;

  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);

  return (
    <LinguiClientProvider
      initialLocale={supportedLang}
      initialMessages={allMessages[supportedLang]!}
    >
      <BlogsPage selectedCategory={category} lang={supportedLang} />
    </LinguiClientProvider>
  );
}
