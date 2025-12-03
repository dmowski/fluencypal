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
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { Footer } from "./components/Footer";

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
        <Stack sx={{ alignItems: "center", gap: "300px" }}>
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

          <Stack
            sx={{
              width: "100%",
            }}
          >
            <PriceCards
              title={i18n._("Choose your interview preparation plan")}
              subTitle={i18n._("Everything you need to stand out and get the job")}
              footerText={i18n._(
                "All plans include instant access • No commitment • Secure payment"
              )}
              prices={interviewData.price}
            />
            <GeneralFaqBlock
              padding={"100px 0 0 0"}
              title={i18n._(`FAQ`)}
              items={[
                {
                  question: i18n._(`How does the interview preparation platform work?`),
                  answer: (
                    <Typography>
                      {i18n._(
                        `Our AI-powered platform simulates real interview scenarios tailored to your target role. You'll receive personalized questions, instant feedback on your answers, and detailed performance analytics to track your improvement.`
                      )}
                    </Typography>
                  ),
                },
                {
                  question: i18n._(`What types of interviews can I practice for?`),
                  answer: (
                    <Typography>
                      {i18n._(
                        `We support various interview formats including behavioral interviews, technical interviews, case studies, and role-specific scenarios across multiple industries and job levels.`
                      )}
                    </Typography>
                  ),
                },
                {
                  question: i18n._(`How long does it take to see improvement?`),
                  answer: (
                    <Typography>
                      {i18n._(
                        `Most users report noticeable improvement within 1-2 weeks of consistent practice. Our data shows that candidates who complete at least 10 practice sessions increase their interview success rate by up to 60%.`
                      )}
                    </Typography>
                  ),
                },
                {
                  question: i18n._(`Can I practice for specific companies or positions?`),
                  answer: (
                    <Typography>
                      {i18n._(
                        `Yes! You can customize your practice sessions based on specific job titles, companies, and industries. Our AI adapts questions to match the interviewing style of your target employers.`
                      )}
                    </Typography>
                  ),
                },
                {
                  question: i18n._(`What kind of feedback will I receive?`),
                  answer: (
                    <Typography>
                      {i18n._(
                        `You'll get comprehensive feedback including clarity scores, communication analysis, content quality assessment, suggested improvements, and comparison with best practices for your industry.`
                      )}
                    </Typography>
                  ),
                },
                {
                  question: i18n._(`Is there a free trial available?`),
                  answer: (
                    <Typography>
                      {i18n._(
                        `Yes, you can start with our free trial that includes access to basic interview scenarios and limited feedback. Upgrade anytime to unlock unlimited practice sessions and advanced features.`
                      )}
                    </Typography>
                  ),
                },
                {
                  question: i18n._(`Can I cancel my subscription at any time?`),
                  answer: (
                    <Typography>
                      {i18n._(
                        `Absolutely. There are no long-term commitments. You can cancel your subscription at any time, and you'll retain access until the end of your current billing period.`
                      )}
                    </Typography>
                  ),
                },
              ]}
            />
            <CtaBlock
              title={i18n._(`Ready to ace your next interview?`)}
              actionButtonTitle={i18n._(`Start Practicing Now`)}
              actionButtonLink={`${getUrlStart(lang)}quiz`}
            />
            <Footer lang={lang} />
          </Stack>
        </Stack>
      </main>
    </Stack>
  );
}
