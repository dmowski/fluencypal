import {
  fullEnglishLanguageName,
  SupportedLanguage,
  supportedLanguagesToLearn,
} from "@/features/Lang/lang";
import { InterviewData } from "../types";
import { I18n } from "@lingui/core";
import { Stack, Typography } from "@mui/material";
import { InterviewHeader } from "./components/InterviewHeader";
import { MainTitleSection } from "./components/MainTitleSection";
import { InfoCards } from "./components/InfoCards";
import { ScorePreviewSection } from "./components/ScorePreviewSection";
import { StepInfoCards } from "./components/StepsInfoCards";
import { ReviewCards } from "./components/ReviewCards";
import { PriceCards } from "./components/PriceCards";
import { GeneralFaqBlock } from "@/features/Landing/FAQ/GeneralFaqBlock";
import { CtaBlock } from "@/features/Landing/ctaBlock";
import { Footer } from "./components/Footer";
import { getUrlStart } from "@/features/Lang/getUrlStart";

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
  const pageUrl = getUrlStart(lang) + `interview/${id}`;
  const quizLink = `${pageUrl}/quiz`;

  return (
    <Stack sx={{ width: "100%" }}>
      <InterviewHeader lang={lang} startTrialHref={quizLink} pageUrl={pageUrl} />
      <main style={{ width: "100%", margin: 0 }}>
        <Stack sx={{ alignItems: "center", gap: "0" }}>
          <MainTitleSection
            label={interviewData.jobTitle}
            title={interviewData.title}
            subtitle={interviewData.subTitle}
            buttonHref={quizLink}
            buttonTitle={i18n._("Start Your Interview Test")}
          />

          <InfoCards
            id="results"
            title={i18n._("What you will achieve")}
            subtitle={i18n._("Real outcomes that transform your interview performance")}
            buttonTitle={i18n._("Start Free Trial")}
            buttonHref={quizLink}
            cards={interviewData.infoCards}
          />

          <ScorePreviewSection
            id="test"
            title={i18n._("Take the Interview Readiness Test")}
            subtitle={i18n._("In less then 5 minutes, you'll get:")}
            infoList={interviewData.whatUserGetAfterFirstTest}
            buttonTitle={i18n._("Start Test")}
            buttonHref={quizLink}
            scorePreview={interviewData.scorePreview}
          />

          <StepInfoCards
            id="steps"
            title={i18n._("Why candidates improve so quickly")}
            subtitle={i18n._("A proven method that delivers measurable results")}
            cards={interviewData.stepInfoCards}
          />

          <ReviewCards
            id="reviews"
            title={i18n._("Real people. Real job offers.")}
            subTitle={i18n._("Join thousands who transformed their interview performance")}
            reviews={interviewData.reviewsData}
          />

          <Stack
            sx={{
              width: "100%",
            }}
          >
            <PriceCards
              id="price"
              quizLink={quizLink}
              title={i18n._("Choose your interview preparation plan")}
              subTitle={i18n._("Everything you need to stand out and get the job")}
              footerText={i18n._(
                "All plans include instant access • No commitment • Secure payment"
              )}
              prices={interviewData.price}
            />
            <GeneralFaqBlock
              id="faq"
              padding={"0px 0 90px 0"}
              title={i18n._(`FAQ`)}
              items={interviewData.faqItems}
            />
            <CtaBlock
              title={i18n._(`Ready to ace your next interview?`)}
              actionButtonTitle={i18n._(`Start Practicing Now`)}
              actionButtonLink={quizLink}
            />
            <Footer lang={lang} />
          </Stack>
        </Stack>
      </main>
    </Stack>
  );
}
