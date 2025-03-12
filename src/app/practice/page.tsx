import { allMessages } from "@/appRouterI18n";
import { supportedLanguages } from "@/common/lang";
import { ConversationPage } from "@/features/Conversation/ConversationPage";
import { Header } from "@/features/Header/Header";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";
import { getRolePlayScenarios } from "@/features/RolePlay/rolePlayData";
import { initLingui } from "@/initLingui";
import { Metadata } from "next";
import { generateMetadataInfo } from "@/libs/metadata";

export async function generateStaticParams() {
  return supportedLanguages.map((lang: string) => ({ lang }));
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return generateMetadataInfo({
    lang: (await props.params).lang,
    currentPath: "practice",
  });
}

export default async function Page(props: { params: Promise<{ lang: string }> }) {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);

  const rolePlayScenarios = getRolePlayScenarios(supportedLang);

  return (
    <LinguiClientProvider initialLocale={lang} initialMessages={allMessages[lang]!}>
      <Header mode="practice" lang={supportedLang} />
      <main>
        <ConversationPage rolePlayScenarios={rolePlayScenarios} lang={supportedLang} />
      </main>
    </LinguiClientProvider>
  );
}
