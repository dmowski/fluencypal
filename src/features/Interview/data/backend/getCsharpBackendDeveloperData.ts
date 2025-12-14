import { InterviewData } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getCsharpBackendDeveloperCoreData } from "./coreData";
import { getBackendFirstScreenSection } from "./firstScreenSection";
import { getBackendPriceSection } from "./priceSection";
import { getBackendFaqSection } from "./faqSection";
import { getBackendCallToActionSection } from "./callToActionSection";
import { getBackendInfoCardsSection } from "./infoCardsSection";
import { getBackendScorePreviewSection } from "./scorePreviewSection";
import { getBackendStepInfoSection } from "./stepInfoSection";
import { getBackendReviewSection } from "./reviewSection";
import { getBackendExampleQuestionsSection } from "./exampleQuestionsSection";
import { getBackendTechStackSection } from "./techStackSection";
import { getBackendWhoIsThisForSection } from "./whoIsThisForSection";
import { getBackendDemoSnippetSection } from "./demoSnippetSection";
import { getCsharpBackendDeveloperQuizData } from "./quizData";

export const getCsharpBackendDeveloperData = (lang: SupportedLanguage): InterviewData => {
  return {
    coreData: getCsharpBackendDeveloperCoreData(lang),
    sections: [
      getBackendFirstScreenSection(lang),
      getBackendInfoCardsSection(lang),
      getBackendScorePreviewSection(lang),
      getBackendStepInfoSection(lang),
      getBackendReviewSection(lang),
      getBackendExampleQuestionsSection(lang),
      getBackendTechStackSection(lang),
      getBackendWhoIsThisForSection(lang),
      getBackendDemoSnippetSection(lang),
      getBackendPriceSection(lang),
      getBackendFaqSection(lang),
      getBackendCallToActionSection(lang),
    ],
    quiz: getCsharpBackendDeveloperQuizData(lang),
  };
};
