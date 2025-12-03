import { SupportedLanguage } from "@/features/Lang/lang";
import { InterviewData } from "../types";
import { I18n } from "@lingui/core";
import { Stack } from "@mui/material";
import { InterviewHeader } from "./components/InterviewHeader";
import { MainTitleSection } from "./components/MainTitleSection";
import { InfoCards } from "./components/InfoCards";
import { ScorePreviewSection } from "./components/ScorePreviewSection";
import { StepInfoCards } from "./components/StepsInfoCards";
import { ReviewCards } from "./components/ReviewCards";
import { PriceCards } from "./components/PriceCards";

export async function InterviewLanding({
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
    <Stack sx={{ width: "100%" }}>
      <InterviewHeader interviewId={id} lang={lang} />
      <main style={{ width: "100%", margin: 0 }}>
        <Stack sx={{ alignItems: "center", gap: "300px", paddingBottom: "300px" }}>
          <MainTitleSection
            label={interviewData.jobTitle}
            title={interviewData.title}
            subtitle={interviewData.subTitle}
            buttonHref={"/practice"}
            buttonTitle={i18n._("Start Your Interview Test")}
          />

          <InfoCards
            title={i18n._("What you will achieve")}
            subtitle={i18n._("Real outcomes that transform your interview performance")}
            buttonTitle={i18n._("Start Free Trial")}
            buttonHref={"/test"}
            cards={interviewData.infoCards}
          />

          <ScorePreviewSection
            title={i18n._("Take the Interview Readiness Test")}
            subtitle={i18n._("In less then 5 minutes, you'll get:")}
            infoList={interviewData.whatUserGetAfterFirstTest}
            buttonTitle={i18n._("Start Test")}
            buttonHref={"/test"}
            scorePreview={interviewData.scorePreview}
          />

          <StepInfoCards
            title={i18n._("Why candidates improve so quickly")}
            subtitle={i18n._("A proven method that delivers measurable results")}
            cards={interviewData.stepInfoCards}
          />

          <ReviewCards
            title={i18n._("Real people. Real job offers.")}
            subTitle={i18n._("Join thousands who transformed their interview performance")}
            reviews={interviewData.reviewsData}
          />

          <PriceCards
            title={i18n._("Choose your interview preparation plan")}
            subTitle={i18n._("Everything you need to stand out and get the job")}
            footerText={i18n._("All plans include instant access • No commitment • Secure payment")}
            prices={interviewData.price}
          />
        </Stack>
      </main>
    </Stack>
  );
}
