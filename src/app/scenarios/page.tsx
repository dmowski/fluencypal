import type { Metadata } from "next";
import { ScenariosPage } from "@/features/Landing/RolePlay/ScenariosPage";
import { supportedLanguages } from "@/features/Lang/lang";
import { generateMetadataInfo } from "@/libs/metadata";

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    category?: string;
  }>;
}

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const category = (await props.searchParams).category || "";
  return generateMetadataInfo({
    lang: (await props.params).lang,
    currentPath: "scenarios",
    category,
  });
}

interface ScenariosPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
  params: Promise<{ lang: string }>;
}
export default async function ScenariosFullPage(props: ScenariosPageProps) {
  const params = await props.searchParams;
  const category = params.category;

  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";

  return (
    <html lang={supportedLang}>
      <body>
        <ScenariosPage selectedCategory={category} lang={supportedLang} />
      </body>
    </html>
  );
}
