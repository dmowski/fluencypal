import { getMetadataIcons, getMetadataUrls, getOpenGraph, getTwitterCard } from "@/libs/metadata";
import type { Metadata } from "next";
import { supportedLanguages } from "../Lang/lang";
import { initLingui } from "@/initLingui";
import { getI18nInstance } from "@/appRouterI18n";
import { siteUrl } from "@/common/metadata";
import { I18n } from "@lingui/core";

export type Ideas = "interview-speed" | "interview-frontend" | "interview-backend";

export const ideas: Ideas[] = ["interview-speed", "interview-frontend", "interview-backend"];

export interface IdeaPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams(idea: Ideas) {
  return [];
}

function getIdeaMetaInfo(idea: Ideas, i18n: I18n) {
  const metaMap: Record<
    Ideas,
    {
      title: string;
      description: string;
      keywords: string[];
    }
  > = {
    "interview-speed": {
      title: i18n._(`Prepare for the Job Interview`),
      description: i18n._(
        `Get ready for your next interview with our comprehensive guide covering common questions, tips, and strategies to help you succeed.`
      ),
      keywords: [
        i18n._(`interview preparation`),
        i18n._(`common interview questions`),
        i18n._(`interview tips`),
        i18n._(`job interview strategies`),
      ],
    },
    "interview-frontend": {
      title: i18n._(`Frontend Interview Preparation`),
      description: i18n._(
        `Master frontend interviews with our in-depth guide featuring essential topics, coding challenges, and best practices to land your dream job.`
      ),
      keywords: [
        i18n._(`frontend interview preparation`),
        i18n._(`frontend interview questions`),
        i18n._(`JavaScript interview tips`),
        i18n._(`CSS interview strategies`),
      ],
    },
    "interview-backend": {
      title: i18n._(`Backend Interview Preparation`),
      description: i18n._(
        `Ace your backend interviews with our expert guide covering key concepts, algorithms, and system design principles to help you succeed.`
      ),
      keywords: [
        i18n._(`backend interview preparation`),
        i18n._(`backend interview questions`),
        i18n._(`database interview tips`),
        i18n._(`API design interview strategies`),
      ],
    },
  };

  return metaMap[idea];
}

export async function generateMetadata(idea: Ideas, props: IdeaPageProps): Promise<Metadata> {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);

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

export default async function Page(idea: Ideas, props: IdeaPageProps) {
  return <></>;
}
