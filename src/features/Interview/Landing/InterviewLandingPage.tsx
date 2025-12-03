import { SupportedLanguage } from "@/features/Lang/lang";
import { InterviewData } from "../types";
import { I18n } from "@lingui/core";
import { Stack } from "@mui/material";
import { InterviewHeader } from "./InterviewHeader";
import { MainTitleSection } from "./MainTitleSection";
import { InfoCards } from "./InfoCards";
import { Info, MessageSquare, PhoneCall, Sparkles, TrendingUp } from "lucide-react";
import { ScorePreviewSection } from "./ScorePreviewSection";

export async function InterviewLandingPage({
  lang,
  id,
  interviewData,
  i18n,
}: {
  lang: SupportedLanguage;
  id: string;
  interviewData: InterviewData;
  i18n: I18n;
}) {
  return (
    <Stack sx={{ width: "100%", margin: 0, padding: 0 }}>
      <InterviewHeader interviewId={id} lang={lang} />
      <main style={{ width: "100%", margin: 0 }}>
        <Stack sx={{ alignItems: "center" }}>
          <MainTitleSection
            label={interviewData.jobTitle}
            title={interviewData.title}
            subtitle={interviewData.subTitle}
            buttonHref={"/practice"}
            buttonTitle={"Start Your Interview Test"}
          />
          <InfoCards
            title={"What you will achieve"}
            subtitle={"Real outcomes that transform your interview performance"}
            buttonTitle={"Start Free Trial"}
            buttonHref={"/test"}
            cards={interviewData.infoCards}
          />
          <ScorePreviewSection
            title={"Take the Interview Readiness Test"}
            subtitle={"In 2 minutes, you'll get:"}
            infoList={[
              "Personalized Interview Readiness Score",
              "Detailed feedback on your strengths and weaknesses",
              "Actionable tips to improve your skills",
            ]}
            buttonTitle={"Start Test"}
            buttonHref={"/test"}
            scorePreview={{
              label: "Interview Readiness Score",
              totalScore: 85,
              description:
                "Strong knowledge of TypeScript and Angular.js. It might be worth polishing Soft Skills.",

              buttonTitle: "Get My Score",
              buttonHref: "/test",

              scoreMetrics: [
                { title: "Angular.js knowledge", score: 85 },
                { title: "Coding Skills", score: 90 },
                { title: "Problem Solving", score: 80 },
                { title: "Communication", score: 25 },
              ],
            }}
          />
        </Stack>
      </main>
    </Stack>
  );
}
