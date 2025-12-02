import { supportedLanguages } from "@/features/Lang/lang";
import { ConversationPage } from "@/features/Conversation/ConversationPage";
import { getRolePlayScenarios } from "@/features/RolePlay/rolePlayData";
import { Metadata } from "next";
import { generateMetadataInfo } from "@/features/SEO/metadata";
import { PracticeProvider } from "../practiceProvider";
import { TopOffset } from "@/features/Layout/TopOffset";

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
  return generateMetadataInfo({
    lang: (await props.params).lang,
    currentPath: "practice",
    rolePlayId,
  });
}

export default async function Page(props: { params: Promise<{ lang: string }> }) {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  const rolePlayInfo = getRolePlayScenarios(supportedLang);

  return (
    <html lang={supportedLang}>
      <body>
        <PracticeProvider>
          <TopOffset />
          <main>
            <ConversationPage rolePlayInfo={rolePlayInfo} lang={supportedLang} />
          </main>
        </PracticeProvider>
      </body>
    </html>
  );
}
