import { InterviewData } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getQuizData } from "./quizData";
import { getPriceSection } from "./priceSection";
import { getFaqSection } from "./faqSection";
import { getStepInfoSection } from "./stepInfoSection";
import { getReviewSection } from "./reviewSection";
import { getScorePreviewSection } from "./scorePreviewSection";
import { getCallToActionSection } from "./callToActionSection";
import { getInfoCardsSection } from "./infoCardsSection";
import { getFirstScreenSection } from "./firstScreenSection";
import { getExampleQuestionsSection } from "./exampleQuestionsSection";
import { getTechStackSection } from "./techStackSection";
import { getDemoSnippetSection } from "./demoSnippetSection";
import { getCoreData } from "./coreData";
import { getWhoIsThisForSection } from "../frontend-senior/whoIsThisForSection";
import { getPainSection } from "../frontend-senior/painSection";
import { getWebcamDemoSection } from "../frontend-senior/webcamDemoSection";

export default function getLandingData(lang: SupportedLanguage): InterviewData {
  return {
    coreData: getCoreData(lang),
    sections: [
      getFirstScreenSection(lang),
      getPainSection(lang),
      getWebcamDemoSection(lang),
      getInfoCardsSection(lang),
      getScorePreviewSection(lang),
      getStepInfoSection(lang),
      getReviewSection(lang),
      getExampleQuestionsSection(lang),
      getTechStackSection(lang),
      getWhoIsThisForSection(lang),
      getDemoSnippetSection(lang),
      getPriceSection(lang),
      getFaqSection(lang),
      getCallToActionSection(lang),
    ],
    quiz: getQuizData(lang),
  };
}
