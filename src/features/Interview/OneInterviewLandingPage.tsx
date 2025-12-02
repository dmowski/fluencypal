import {
  getMetadataIcons,
  getMetadataUrls,
  getOpenGraph,
  getTwitterCard,
} from "@/features/SEO/metadata";
import type { Metadata } from "next";
import { SupportedLanguage, supportedLanguages } from "../Lang/lang";
import { initLingui } from "@/initLingui";
import { getI18nInstance } from "@/appRouterI18n";
import { siteUrl } from "@/common/metadata";
import { NotFoundPage } from "../NotFound/NotFoundPage";
import { getAllInterviews } from "./interviewData";

export interface InterviewPageProps {
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

export async function generateInterviewStaticParams() {
  return [];
}

export async function generateInterviewMetadata(props: InterviewPageProps): Promise<Metadata> {
  const params = await props.params;
  const id = params.id;
  const lang = (params.lang || "en") as SupportedLanguage;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";

  const allInterviews = getAllInterviews(lang);
  const allIds = allInterviews.interviews.map((interview) => interview.id);
  const interviewData = allInterviews.interviews.find((interview) => interview.id === id);
  initLingui(supportedLang);

  if (!interviewData) {
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
  const pagePath = "interview";

  const metadataUrls = getMetadataUrls({
    pagePath,
    id,
    queries: {},
    supportedLang,
  });

  return {
    keywords: interviewData.keywords,
    title: interviewData.title,
    metadataBase: new URL(siteUrl),
    description: interviewData.subTitle,
    alternates: metadataUrls.alternates,
    icons: getMetadataIcons(),
    openGraph: getOpenGraph({
      title: interviewData.title,
      description: interviewData.subTitle,
      ogUrl: metadataUrls.ogUrl,
      alt: i18n._(`Prepare for the Interview`),
    }),
    twitter: getTwitterCard({
      title: interviewData.title,
      description: interviewData.subTitle,
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

export async function OneInterviewLandingPage({
  langParam,
  id,
}: {
  langParam: string | undefined;
  id: string;
}) {
  const lang = (langParam || "en") as SupportedLanguage;
  const allInterviews = getAllInterviews(lang);
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  const interviewData = allInterviews.interviews.find((interview) => interview.id === id);
  if (!interviewData) {
    return <NotFoundPage lang={supportedLang} />;
  }

  return (
    <html lang={supportedLang}>
      <body>
        <p>{interviewData.title}</p>
        <p>{interviewData.subTitle}</p>
      </body>
    </html>
  );
}
