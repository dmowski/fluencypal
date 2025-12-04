import {
  fullEnglishLanguageName,
  SupportedLanguage,
  supportedLanguagesToLearn,
} from "@/features/Lang/lang";
import { InterviewData } from "../types";
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
}: {
  lang: SupportedLanguage;
  id: string;
  interviewData: InterviewData;
}) {
  const pageUrl = getUrlStart(lang) + `interview/${id}`;
  const quizLink = `${pageUrl}/quiz`;
  const { landingMessages } = interviewData;

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
            buttonTitle={landingMessages.startYourInterviewTest}
          />

          <InfoCards
            id="results"
            title={landingMessages.whatYouWillAchieve}
            subtitle={landingMessages.realOutcomesThatTransform}
            buttonTitle={landingMessages.startFreeTrial}
            buttonHref={quizLink}
            cards={interviewData.infoCards}
          />

          <ScorePreviewSection
            id="test"
            title={landingMessages.takeTheInterviewReadinessTest}
            subtitle={landingMessages.inLessThen5Minutes}
            infoList={interviewData.whatUserGetAfterFirstTest}
            buttonTitle={landingMessages.startTest}
            buttonHref={quizLink}
            scorePreview={interviewData.scorePreview}
          />

          <StepInfoCards
            id="steps"
            title={landingMessages.whyCandidatesImprove}
            subtitle={landingMessages.aProvenMethodThatDelivers}
            cards={interviewData.stepInfoCards}
          />

          <ReviewCards
            id="reviews"
            title={landingMessages.realPeopleRealJobOffers}
            subTitle={landingMessages.joinThousandsWhoTransformed}
            reviews={interviewData.reviewsData}
          />

          <PriceCards
            id="price"
            quizLink={quizLink}
            title={landingMessages.chooseYourInterviewPreparationPlan}
            subTitle={landingMessages.everythingYouNeedToStandOut}
            footerText={landingMessages.allPlansIncludeInstantAccess}
            prices={interviewData.price}
          />

          <GeneralFaqBlock
            id="faq"
            padding={"0px 0 90px 0"}
            title={landingMessages.faq}
            items={interviewData.faqItems.map((faq) => ({
              question: faq.question,
              answer: <Typography>{faq.answer}</Typography>,
            }))}
          />

          <CtaBlock
            title={landingMessages.readyToAceYourNextInterview}
            actionButtonTitle={landingMessages.startPracticingNow}
            actionButtonLink={quizLink}
          />
          <Footer lang={lang} />
        </Stack>
      </main>
    </Stack>
  );
}
