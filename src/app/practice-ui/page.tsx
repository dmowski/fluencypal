import { allMessages } from "@/appRouterI18n";
import { supportedLanguages } from "@/common/lang";
import { HeaderPractice } from "@/features/Header/HeaderPractice";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";
import { getRolePlayScenarios } from "@/features/RolePlay/rolePlayData";
import { initLingui } from "@/initLingui";
import { Metadata } from "next";
import { generateMetadataInfo } from "@/libs/metadata";
import { ConversationPageTest } from "@/features/Conversation/ConversationPageTest";
import { PracticeProvider } from "../practiceProvider";

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
  initLingui(supportedLang);

  const rolePlayInfo = getRolePlayScenarios(supportedLang);

  return (
    <LinguiClientProvider
      initialLocale={supportedLang}
      initialMessages={allMessages[supportedLang]!}
    >
      <PracticeProvider>
        <HeaderPractice lang={supportedLang} />
        <main>
          <ConversationPageTest rolePlayInfo={rolePlayInfo} lang={supportedLang} />
        </main>
      </PracticeProvider>
    </LinguiClientProvider>
  );
}
