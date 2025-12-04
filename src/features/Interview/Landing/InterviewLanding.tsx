import { SupportedLanguage } from "@/features/Lang/lang";
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

  return (
    <Stack sx={{ width: "100%" }}>
      <InterviewHeader lang={lang} startTrialHref={quizLink} pageUrl={pageUrl} />
      <main style={{ width: "100%", margin: 0 }}>
        <Stack sx={{ alignItems: "center", gap: "0" }}>
          {interviewData.sections.map((section, index) => {
            if (section.type === "firstScreen") {
              return (
                <MainTitleSection
                  key={index}
                  title={section.title}
                  subtitle={section.subTitle}
                  label={section.label}
                  buttonTitle={section.buttonTitle}
                  buttonHref={quizLink}
                />
              );
            }
            if (section.type === "infoCards") {
              return (
                <InfoCards
                  key={index}
                  id="results"
                  title={section.title}
                  subtitle={section.subTitle}
                  buttonTitle={section.buttonTitle}
                  buttonHref={quizLink}
                  cards={section.infoCards}
                />
              );
            }
            if (section.type === "scorePreview") {
              return (
                <ScorePreviewSection
                  key={index}
                  id="score-preview"
                  title={section.title}
                  subtitle={section.subTitle}
                  infoList={section.infoList}
                  scorePreview={section.scorePreview}
                  buttonTitle={section.buttonTitle}
                  buttonHref={quizLink}
                />
              );
            }
            if (section.type === "review") {
              return (
                <ReviewCards
                  key={index}
                  id="reviews"
                  title={section.title}
                  subTitle={section.subTitle}
                  reviews={section.reviews}
                />
              );
            }

            if (section.type === "price") {
              return (
                <PriceCards
                  key={index}
                  id="price"
                  quizLink={quizLink}
                  title={section.title}
                  subTitle={section.subTitle}
                  prices={section.prices}
                />
              );
            }

            if (section.type === "faq") {
              return (
                <GeneralFaqBlock
                  key={index}
                  id="faq"
                  padding={"0px 0 90px 0"}
                  title={section.title}
                  items={section.faqItems.map((faq) => ({
                    question: faq.question,
                    answer: <Typography>{faq.answer}</Typography>,
                  }))}
                />
              );
            }
            if (section.type === "stepInfoCard") {
              return (
                <StepInfoCards
                  key={index}
                  id="steps"
                  title={section.title}
                  subtitle={section.subTitle}
                  cards={section.stepInfoCards}
                />
              );
            }

            if (section.type === "callToAction") {
              return (
                <CtaBlock
                  key={index}
                  title={section.title}
                  actionButtonTitle={section.buttonTitle}
                  actionButtonLink={quizLink}
                />
              );
            }
            return <div key={index}></div>;
          })}

          <Footer lang={lang} />
        </Stack>
      </main>
    </Stack>
  );
}
