import { SupportedLanguage } from "@/features/Lang/lang";
import { InterviewData } from "../types";
import { I18n } from "@lingui/core";
import { Stack } from "@mui/material";
import { InterviewHeader } from "./InterviewHeader";
import { MainTitleSection } from "./MainTitleSection";
import { InfoCards } from "./InfoCards";
import { ScorePreviewSection } from "./ScorePreviewSection";
import { StepInfoCards } from "./StepsInfoCards";
import { ReviewCards, Review } from "./ReviewCards";

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
        <Stack sx={{ alignItems: "center", gap: "300px", paddingBottom: "300px" }}>
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
            subtitle={"In less then 5 minutes, you'll get:"}
            infoList={interviewData.whatUserGetAfterFirstTest}
            buttonTitle={"Start Test"}
            buttonHref={"/test"}
            scorePreview={interviewData.scorePreview}
          />

          <StepInfoCards
            title={"Why candidates improve so quickly"}
            subtitle={"A proven method that delivers measurable results"}
            cards={interviewData.stepInfoCards}
          />

          <ReviewCards
            title={"Real people. Real job offers."}
            subTitle={"Join thousands who transformed their interview performance"}
            reviews={interviewData.reviewsData}
          />
        </Stack>
      </main>
    </Stack>
  );
}
