import { InterviewData } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getCoreData } from "./coreData";
import { getBackendFirstScreenSection } from "./firstScreenSection";
import { getBackendFaqSection } from "./faqSection";
import { getBackendCallToActionSection } from "./callToActionSection";
import { getBackendInfoCardsSection } from "./infoCardsSection";
import { getBackendScorePreviewSection } from "./scorePreviewSection";
import { getBackendStepInfoSection } from "./stepInfoSection";
import { getBackendExampleQuestionsSection } from "./exampleQuestionsSection";
import { getBackendTechStackSection } from "./techStackSection";
import { getBackendWhoIsThisForSection } from "./whoIsThisForSection";
import { getBackendDemoSnippetSection } from "./demoSnippetSection";
import { getCsharpBackendDeveloperQuizData } from "./quizData";
import { getPriceSection } from "../reusable/priceSection";

export default function getLanding(lang: SupportedLanguage): InterviewData {
  return {
    coreData: getCoreData(lang),
    sections: [
      getBackendFirstScreenSection(lang),
      getBackendInfoCardsSection(lang),
      getBackendScorePreviewSection(lang),
      getBackendStepInfoSection(lang),
      getBackendExampleQuestionsSection(lang),
      getBackendTechStackSection(lang),
      getBackendWhoIsThisForSection(lang),
      getBackendDemoSnippetSection(lang),
      getPriceSection(lang),
      getBackendFaqSection(lang),
      getBackendCallToActionSection(lang),
    ],
    quiz: getCsharpBackendDeveloperQuizData(lang),
  };
}
