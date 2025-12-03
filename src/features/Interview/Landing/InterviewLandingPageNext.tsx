import { generateMetadataInfo } from "@/features/SEO/metadata";
import type { Metadata } from "next";
import { SupportedLanguage, supportedLanguages } from "../../Lang/lang";
import { NotFoundPage } from "../../NotFound/NotFoundPage";
import { getAllInterviews } from "../data";
import { getI18nInstance } from "@/appRouterI18n";
import { InterviewLanding } from "./InterviewLanding";

export interface InterviewPageProps {
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

export async function generateInterviewStaticParams() {
  const { interviews } = getAllInterviews("en");
  return supportedLanguages
    .map((lang: string) => {
      return interviews.map((item) => {
        return { id: item.id, lang };
      });
    })
    .flat();
}

export async function generateInterviewMetadata(props: InterviewPageProps): Promise<Metadata> {
  const params = await props.params;
  const id = params.id;
  const lang = (params.lang || "en") as SupportedLanguage;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";

  return generateMetadataInfo({
    lang: supportedLang,
    interviewId: id,
    currentPath: "interview",
  });
}

export async function InterviewLandingPageNext({
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
  const i18n = getI18nInstance(lang);
  if (!interviewData) {
    return <NotFoundPage lang={supportedLang} />;
  }

  const content = (
    <InterviewLanding i18n={i18n} lang={supportedLang} id={id} interviewData={interviewData} />
  );

  if (lang === "en") {
    return (
      <html lang="en">
        <body>{content}</body>
      </html>
    );
  }

  return content;
}
