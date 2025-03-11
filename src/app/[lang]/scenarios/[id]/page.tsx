import type { Metadata } from "next";
import { getRolePlayScenarios } from "@/features/RolePlay/rolePlayData";
import { ScenarioOnePage } from "@/features/Landing/RolePlay/ScenarioOnePage";
import { openGraph, robots, siteUrl, twitter } from "@/common/metadata";
import { supportedLanguages } from "@/common/lang";
import { initLingui } from "@/initLingui";
import { allMessages, getI18nInstance } from "@/appRouterI18n";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";

interface PageProps {
  params: Promise<{ id: string; lang: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const id = params.id;
  const lang = params.lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);
  const rolePlayScenarios = getRolePlayScenarios(supportedLang);

  const i18n = getI18nInstance(supportedLang);

  const scenario = rolePlayScenarios.find((s) => s.id === id);
  if (!scenario) {
    return {};
  }

  const title =
    `${scenario.title} - ` + i18n._(`Practice English Conversation with AI | FluencyPal`);
  const description = scenario.subTitle;

  const metadata: Metadata = {
    title,
    description,

    keywords: [
      i18n._(`AI English Tutor`),
      i18n._(`English Role-Play`),
      i18n._(`Conversational English Practice`),
      i18n._(`English Fluency`),
      i18n._(`Advanced English Conversation`),
      i18n._(`Online Language Practice`),
      i18n._(`Language Immersion`),
      i18n._(`Real-Life English Scenarios`),
      i18n._(`English Speaking Exercises`),
    ],
    openGraph: {
      ...openGraph,
      title,
      description,
      url: `${siteUrl}scenarios/${id}`,
      siteName: "FluencyPal",
      images: [
        {
          url: `${siteUrl}${scenario.imageSrc}`,
          width: 1200,
          height: 630,
          alt: `FluencyPal - ${scenario.title}`,
        },
      ],
    },
    twitter: {
      ...twitter,
      title: `Practice ${scenario.title} | FluencyPal`,
      description: scenario.subTitle,
      images: [`${siteUrl}${scenario.imageSrc}`],
    },
    robots: robots,
  };
  return metadata;
}

export default async function ScenarioOneFullPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;

  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);
  return (
    <LinguiClientProvider initialLocale={lang} initialMessages={allMessages[lang]!}>
      <ScenarioOnePage id={id} lang={supportedLang} />
    </LinguiClientProvider>
  );
}
