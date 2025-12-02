import { generateMetadataInfo } from "@/features/SEO/metadata";
import { HeaderStatic } from "../Header/HeaderStatic";
import type { Metadata } from "next";
import { SupportedLanguage, supportedLanguages } from "../Lang/lang";
import { NotFoundPage } from "../NotFound/NotFoundPage";
import { getAllInterviews } from "./interviewData";
import { Stack } from "@mui/material";
import { WelcomeScreen } from "../Landing/WelcomeScreen";
import { getI18nInstance } from "@/appRouterI18n";
import { getUrlStart } from "../Lang/getUrlStart";
import { PlanLandingBlock } from "../Landing/PlanLandingBlock";
import { InterviewData } from "./types";

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

async function OneInterviewContent({
  lang,
  id,
  interviewData,
}: {
  lang: SupportedLanguage;
  id: string;
  interviewData: InterviewData;
}) {
  const i18n = getI18nInstance(lang);
  return (
    <>
      <HeaderStatic lang={lang} transparentOnTop />
      <p>{interviewData.title}</p>
      <p>{interviewData.subTitle}</p>
      <main style={{ width: "100%", margin: 0 }}>
        <Stack sx={{ alignItems: "center" }}>
          <WelcomeScreen
            getStartedTitle={i18n._(`Get Started`)}
            pricingLink={`${getUrlStart(lang)}pricing`}
            practiceLink={`${getUrlStart(lang)}quiz`}
            openMyPracticeLinkTitle={i18n._(`Open`)}
            lang={lang}
          />
          <PlanLandingBlock lang={lang} />
        </Stack>
      </main>
    </>
  );
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

  const content = (
    <OneInterviewContent lang={supportedLang} id={id} interviewData={interviewData} />
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
