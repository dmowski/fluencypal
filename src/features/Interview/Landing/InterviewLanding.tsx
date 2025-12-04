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
import { ExampleQuestionsSection } from "./components/ExampleQuestionsSection";
import { TechStackSection } from "./components/TechStackSection";
import { WhoIsThisForSection } from "./components/WhoIsThisForSection";
import { DemoSnippetSection } from "./components/DemoSnippetSection";

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
            //exampleQuestions
            if (section.type === "exampleQuestions") {
              return (
                <ExampleQuestionsSection
                  key={index}
                  title={section.title}
                  subTitle={section.subTitle}
                  questions={section.questions}
                  id={"example-questions"}
                />
              );
            }

            // techStack
            if (section.type === "techStack") {
              return (
                <TechStackSection
                  id={"tech-stack"}
                  key={index}
                  title={section.title}
                  subTitle={section.subTitle}
                  keyPoints={section.keyPoints}
                  techGroups={section.techGroups}
                />
              );
            }

            // whoIsThisFor
            if (section.type === "whoIsThisFor") {
              return (
                <WhoIsThisForSection
                  id={"who-is-this-for"}
                  key={index}
                  title={section.title}
                  subTitle={section.subTitle}
                  audienceItems={section.audienceItems}
                />
              );
            }

            // demoSnippet
            if (section.type === "demoSnippet") {
              return (
                <DemoSnippetSection
                  id={"demo-snippet"}
                  key={index}
                  title={section.title}
                  subTitle={section.subTitle}
                  demoItems={section.demoItems}
                />
              );
            }

            //first screen
            if (section.type === "firstScreen") {
              return (
                <MainTitleSection
                  key={index}
                  title={section.title}
                  subTitle={section.subTitle}
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
                  subTitle={section.subTitle}
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
                  subTitle={section.subTitle}
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
                  padding={"150px 0 90px 0"}
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
                  subTitle={section.subTitle}
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
