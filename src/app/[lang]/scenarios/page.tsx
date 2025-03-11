import type { Metadata } from "next";
import { ScenariosPage } from "@/features/Landing/RolePlay/ScenariosPage";
import { robots, siteUrl } from "@/common/metadata";
import { APP_NAME } from "@/features/Landing/landingSettings";
import { supportedLanguages } from "@/common/lang";
import { initLingui } from "@/initLingui";
import { allMessages, getI18nInstance } from "@/appRouterI18n";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const lang = params.lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);

  const i18n = getI18nInstance(supportedLang);

  const title = i18n._(`Real-Life English Role-Play Scenarios`) + " | " + APP_NAME;
  const description = i18n._(
    `Practice realistic English conversations with FluencyPal’s AI tutor. From job interviews to casual chats, build fluency and confidence through immersive role-play scenarios designed for intermediate and advanced learners.`
  );

  const metadata: Metadata = {
    title,
    description,

    keywords: [
      i18n._(`English Role-Play`),
      i18n._(`English Speaking Practice`),
      i18n._(`AI English Tutor`),
      i18n._(`Advanced English Conversation`),
      i18n._(`Practice English Online`),
      i18n._(`Real-Life English Scenarios`),
      i18n._(`Language Immersion`),
      i18n._(`Fluency Improvement`),
    ],
    openGraph: {
      title: i18n._(`Practice Real-Life English Scenarios with AI`) + ` | ${APP_NAME}`,
      description: i18n._(
        `Boost your English fluency with interactive AI-powered role-play scenarios. Practice job interviews, daily conversations, travel dialogues, and more. Perfect for intermediate and advanced learners.`
      ),
      url: `${siteUrl}scenarios`,
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
      title: i18n._(`Real-Life English Role-Play | FluencyPal`),
      description: i18n._(
        `Practice real-life English scenarios—job interviews, daily conversations, and more—with FluencyPal’s personalized AI tutor. Perfect for intermediate and advanced learners.`
      ),
      images: [`${siteUrl}openGraph.png`],
      creator: "@dmowskii",
    },
    robots: robots,
  };
  return metadata;
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
  initLingui(supportedLang);

  return (
    <LinguiClientProvider initialLocale={lang} initialMessages={allMessages[lang]!}>
      <ScenariosPage selectedCategory={category} lang={supportedLang} />
    </LinguiClientProvider>
  );
}
