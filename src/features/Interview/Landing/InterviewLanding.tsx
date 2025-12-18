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
import { TextListSection } from "./components/TextListSection";
import { DemoSnippetSection } from "./components/DemoSnippetSection";
import { FaqScript } from "./components/FaqScript";
import { InterviewAnalytics } from "@/features/Analytics/InterviewAnalytics";
import { Theme } from "./components/theme";
import { WebcamSection } from "./components/WebcamSection";

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
            const themeOrder: Theme[] = [
              "dark-blue",
              "dark-red",
              "dark-blue",
              "dark-red",
              "dark-blue",
              "dark-red",
              "dark-blue",
            ];
            const theme = themeOrder[index % themeOrder.length];

            // 1th
            if (section.type === "firstScreen") {
              return (
                <MainTitleSection
                  key={index}
                  title={section.title}
                  subTitle={section.subTitle}
                  label={section.label}
                  buttonTitle={section.buttonTitle}
                  buttonHref={quizLink}
                  bgImageUrl={section.bgImageUrl}
                />
              );
            }

            // 2th
            if (section.type === "infoCards") {
              return (
                <InfoCards
                  key={index}
                  theme={theme}
                  id="results"
                  title={section.title}
                  subTitle={section.subTitle}
                  buttonTitle={section.buttonTitle}
                  buttonHref={quizLink}
                  cards={section.infoCards}
                />
              );
            }

            if (section.type === "webcamDemo") {
              return (
                <WebcamSection
                  key={index}
                  theme={theme}
                  id="webcam-section"
                  data={section}
                  buttonHref={quizLink}
                />
              );
            }

            // 3th
            if (section.type === "scorePreview") {
              return (
                <ScorePreviewSection
                  key={index}
                  theme={theme}
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

            // 4th
            if (section.type === "stepInfoCard") {
              return (
                <StepInfoCards
                  theme={theme}
                  key={index}
                  id="steps"
                  title={section.title}
                  subTitle={section.subTitle}
                  cards={section.stepInfoCards}
                />
              );
            }

            // 5th
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

            // 6th
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

            // 7th
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

            if (section.type === "textList") {
              return (
                <TextListSection
                  id={"text-list"}
                  key={index}
                  title={section.title}
                  subTitle={section.subTitle}
                  textList={section.textList}
                  buttonHref={quizLink}
                  buttonTitle={section.buttonTitle}
                  theme={theme}
                />
              );
            }

            if (section.type === "demoSnippet") {
              return (
                <DemoSnippetSection
                  id={"demo-snippet"}
                  key={index}
                  title={section.title}
                  subTitle={section.subTitle}
                  demoItems={section.demoItems}
                  lang={lang}
                />
              );
            }

            // 10th
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

            // 11th
            if (section.type === "faq") {
              return (
                <div key={index}>
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
                  <FaqScript
                    items={section.faqItems}
                    url={pageUrl}
                    lang={lang}
                    pageTitle={interviewData.coreData.title}
                    description={interviewData.coreData.subTitle}
                  />
                </div>
              );
            }

            // 12th
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
