import { supportedLanguages } from "@/features/Lang/lang";
import { Metadata } from "next";
import { generateMetadataInfo } from "@/features/SEO/metadata";
import { PracticeProvider } from "../practiceProvider";
import { HeaderPractice } from "@/features/Header/HeaderPractice";
import { AdminStats } from "@/features/Analytics/AdminStats";

export async function generateStaticParams() {
  return supportedLanguages.map((lang: string) => ({ lang }));
}

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    rolePlayId?: string;
  }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const rolePlayId = (await props.searchParams).rolePlayId;
  return {
    ...generateMetadataInfo({
      lang: (await props.params).lang,
      currentPath: "practice",
      rolePlayId,
    }),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function Page(props: { params: Promise<{ lang: string }> }) {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";

  return (
    <html lang={supportedLang}>
      <body>
        <PracticeProvider>
          <HeaderPractice lang={supportedLang} />
          <main>
            <AdminStats />
          </main>
        </PracticeProvider>
      </body>
    </html>
  );
}
