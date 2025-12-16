import { InterviewData } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getQuizData } from "../frontend-senior-simple/quizData";
import { getPriceSection } from "../frontend-senior-simple/priceSection";
import { getFaqSection } from "../frontend-senior-simple/faqSection";
import { getStepInfoSection } from "../frontend-senior-simple/stepInfoSection";
import { getReviewSection } from "../frontend-senior-simple/reviewSection";
import { getScorePreviewSection } from "../frontend-senior-simple/scorePreviewSection";
import { getCallToActionSection } from "../frontend-senior-simple/callToActionSection";
import { getInfoCardsSection } from "../frontend-senior-simple/infoCardsSection";
import { getFirstScreenSection } from "../frontend-senior-simple/firstScreenSection";
import { getExampleQuestionsSection } from "../frontend-senior-simple/exampleQuestionsSection";
import { getTechStackSection } from "../frontend-senior-simple/techStackSection";
import { getWhoIsThisForSection } from "../frontend-senior-simple/whoIsThisForSection";
import { getDemoSnippetSection } from "../frontend-senior-simple/demoSnippetSection";
import { getCoreData } from "../frontend-senior-simple/coreData";

export default function getLandingData(lang: SupportedLanguage): InterviewData {
  return {
    coreData: { ...getCoreData(lang), id: "front" },
    sections: [
      getFirstScreenSection(lang),
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
