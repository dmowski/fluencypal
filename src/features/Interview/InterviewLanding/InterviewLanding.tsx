"use client";
import { SupportedLanguage } from "@/features/Lang/lang";
import { Box } from "@mui/material";
import { FAQSection } from "./FAQSection";
import { FinalCTASection } from "./FinalCTASection";
import { HeroSection } from "./HeroSection";
import { HowItWorksSection } from "./HowItWorksSection";
import { OutcomeSection } from "./OutcomeSection";
import { PricingSection } from "./PricingSection";
import { ReadinessTestSection } from "./ReadinessTestSection";
import { SocialProofSection } from "./SocialProofSection";
import { TestimonialsSection } from "./TestimonialsSection";

export const InterviewLanding = ({ lang }: { lang: SupportedLanguage }) => {
  return (
    <Box>
      <HeroSection />
      <SocialProofSection />
      <OutcomeSection />
      <ReadinessTestSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <FinalCTASection />
    </Box>
  );
};
