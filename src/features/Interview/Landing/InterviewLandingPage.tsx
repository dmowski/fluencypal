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
import { PriceCards, Price } from "./PriceCards";
import { Zap, Star, Briefcase } from "lucide-react";

export async function InterviewLandingPage({
  lang,
  id,
  interviewData,
}: {
  lang: SupportedLanguage;
  id: string;
  interviewData: InterviewData;
  i18n: I18n;
}) {
  // Hardcoded test data for pricing plans
  const pricesData: Price[] = [
    {
      icon: Zap,
      badge: "⚡ In a hurry? Perfect for last-minute interviews",
      label: "1-Week Sprint",
      priceUsd: 30,
      description: "Get fast, intensive preparation. Fix your top weaknesses in just 7 days.",
      points: [
        "7 days full access",
        "Daily AI mock interviews",
        "Instant feedback on answers",
        "Personalized scripts for HR & behavioral questions",
      ],
      buttonTitle: "Start 1-Week Sprint — $30",
      buttonHref: "/pricing/1-week",
    },
    {
      icon: Star,
      badge: "⭐ Best for most job seekers",
      label: "Monthly Plan",
      priceUsd: 60,
      priceLabel: "Only $2/day",
      description:
        "Consistent improvement with structured interview coaching and personalized practice.",
      points: [
        "Full access to all simulations",
        "Unlimited answer reviews",
        "CV-based answer optimization",
        "Confidence score tracking",
        "Salary negotiation preparation",
      ],
      buttonTitle: "Start Monthly Plan — $60",
      buttonHref: "/pricing/monthly",
      isHighlighted: true,
    },
    {
      icon: Briefcase,
      badge: "🎯 For long job searches & career growth",
      label: "4-Month Plan",
      priceUsd: 90,
      description:
        "For people preparing for multiple roles, relocating, switching careers, or targeting senior jobs.",
      points: [
        "4 months full access",
        "Long-term interview strategy",
        "Deep skill development",
        "Role-specific answer templates",
        "Priority feedback queue",
      ],
      buttonTitle: "Start 4-Month Plan — $90",
      buttonHref: "/pricing/4-month",
    },
  ];

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

          <PriceCards
            title={"Choose your interview preparation plan"}
            subTitle={"Everything you need to stand out and get the job"}
            footerText={"All plans include instant access • No commitment • Secure payment"}
            prices={pricesData}
          />
        </Stack>
      </main>
    </Stack>
  );
}
