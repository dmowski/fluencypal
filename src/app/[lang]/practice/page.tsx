import { allMessages, getI18nInstance } from "@/appRouterI18n";
import { supportedLanguages } from "@/common/lang";
import { robots, siteUrl } from "@/common/metadata";
import { ConversationPage } from "@/features/Conversation/ConversationPage";
import { Header } from "@/features/Header/Header";
import { APP_NAME } from "@/features/Landing/landingSettings";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";
import { getRolePlayScenarios } from "@/features/RolePlay/rolePlayData";
import { initLingui } from "@/initLingui";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const lang = params.lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);

  const i18n = getI18nInstance(supportedLang);

  const title = i18n._(`Practice`) + " | " + APP_NAME;
  const description = i18n._(
    `Experience next-level language practice with Bruno, your friendly AI tutor. Whether you're a beginner or advanced learner, Bruno adapts to your pace, corrects mistakes, and keeps you motivated.`
  );

  const metadata: Metadata = {
    title,
    description,

    keywords: [
      i18n._(`AI language tutor pricing`),
      i18n._(`Online English`),
      i18n._(`Learn English`),
      i18n._(`AI Language Tutor`),
      i18n._(`English Practice`),
      APP_NAME,
      i18n._(`Language Learning`),
    ],
    openGraph: {
      title: title,
      description: description,
      url: `${siteUrl}${lang}/practice`,
      images: [
        {
          url: `${siteUrl}openGraph.png`,
          width: 1200,
          height: 630,
          alt: `${APP_NAME} – ` + i18n._(`AI English Speaking Practice`),
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [`${siteUrl}openGraph.png`],
      creator: "@dmowskii",
    },
    robots: robots,
  };
  return metadata;
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
        <ConversationPage rolePlayScenarios={rolePlayScenarios} />
      </main>
    </LinguiClientProvider>
  );
}
