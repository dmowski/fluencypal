import { getMetadataIcons, getMetadataUrls, getOpenGraph, getTwitterCard } from "@/libs/metadata";
import type { Metadata } from "next";
import { SupportedLanguage, supportedLanguages } from "../Lang/lang";
import { initLingui } from "@/initLingui";
import { getI18nInstance } from "@/appRouterI18n";
import { siteUrl } from "@/common/metadata";
import { getIdeaMetaInfo } from "./getIdeaMetaInfo";
import { NotFoundPage } from "../NotFound/NotFoundPage";

export type Idea = "interview-speed" | "interview-frontend" | "interview-backend";

export interface IdeaPageProps {
  params: Promise<{
    idea: Idea;
    lang: string;
  }>;
}

export const ideas: Idea[] = ["interview-speed", "interview-frontend", "interview-backend"];

export async function generateIdeaStaticParams() {
  return [];
}

export async function generateIdeaMetadata(props: IdeaPageProps): Promise<Metadata> {
  const params = await props.params;
  const idea = params.idea;
  const lang = (params.lang || "en") as SupportedLanguage;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";

  initLingui(supportedLang);

  if (!ideas.includes(idea)) {
    return {
      title: "Idea Not Found",
      description: "The requested idea does not exist.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const i18n = getI18nInstance(supportedLang);
  const needIndex = false;
  const pagePath = "i";

  const metaInfo = getIdeaMetaInfo(idea, i18n);

  const id = idea;
  const metadataUrls = getMetadataUrls({
    pagePath,
    id,
    queries: {},
    supportedLang,
  });

  return {
    keywords: metaInfo.keywords,
    title: metaInfo.title,
    metadataBase: new URL(siteUrl),
    description: metaInfo.description,
    alternates: metadataUrls.alternates,
    icons: getMetadataIcons(),
    openGraph: getOpenGraph({
      title: metaInfo.title,
      description: metaInfo.description,
      ogUrl: metadataUrls.ogUrl,
      alt: i18n._(`Prepare for the Interview`),
    }),
    twitter: getTwitterCard({
      title: metaInfo.title,
      description: metaInfo.description,
    }),
    other: {
      google: "notranslate",
    },
    robots: {
      index: needIndex,
      follow: true,
    },
  };
}

export async function IdeaLandingPage({
  langParam,
  idea,
}: {
  langParam: string | undefined;
  idea: Idea;
}) {
  const lang = (langParam || "en") as SupportedLanguage;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";

  if (!ideas.includes(idea)) {
    return <NotFoundPage lang={supportedLang} />;
  }
  return (
    <html lang={supportedLang}>
      <body>
        {lang}-{idea}
      </body>
    </html>
  );
}
