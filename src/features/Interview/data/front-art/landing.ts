import { FirstScreenSection, InfoCardsSection, InterviewData } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getQuizData } from "../frontend-senior-simple/quizData";
import { getPriceSection } from "../frontend-senior-simple/priceSection";
import { getFaqSection } from "../frontend-senior-simple/faqSection";
import { getStepInfoSection } from "../frontend-senior-simple/stepInfoSection";
import { getReviewSection } from "../frontend-senior-simple/reviewSection";
import { getScorePreviewSection } from "../frontend-senior-simple/scorePreviewSection";
import { getCallToActionSection } from "../frontend-senior-simple/callToActionSection";
import { getExampleQuestionsSection } from "../frontend-senior-simple/exampleQuestionsSection";
import { getTechStackSection } from "../frontend-senior-simple/techStackSection";
import { getWhoIsThisForSection } from "../frontend-senior-simple/whoIsThisForSection";
import { getDemoSnippetSection } from "../frontend-senior-simple/demoSnippetSection";
import { getCoreData } from "../frontend-senior-simple/coreData";
import { getI18nInstance } from "@/appRouterI18n";

export const getInfoCardsSection = (lang: SupportedLanguage): InfoCardsSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "infoCards",
    title: i18n._("What you will achieve"),
    subTitle: i18n._("Real outcomes that transform your interview performance"),
    buttonTitle: i18n._("Start Your Interview Test"),
    infoCards: [
      {
        title: i18n._("Master technical leadership questions"),
        imageUrl: "https://i.pinimg.com/1200x/dc/a5/ad/dca5ad09a8b982455a7ad89e3e6f6f3e.jpg",
        description: i18n._(
          "Demonstrate expertise in architecture decisions, code reviews, and mentoring junior developers."
        ),
      },
      {
        title: i18n._("Showcase system design thinking"),
        imageUrl: "https://i.pinimg.com/1200x/75/81/1c/75811c0b2f918f212da9ac483371be5d.jpg",
        description: i18n._(
          "Articulate scalable solutions, performance optimization, and frontend architecture patterns."
        ),
      },
      {
        title: i18n._("Stand out in behavioral rounds"),
        imageUrl: "https://i.pinimg.com/736x/4e/09/92/4e0992de17700ec0e6d2a38daaff74c7.jpg",
        description: i18n._(
          "Share compelling stories about cross-team collaboration, conflict resolution, and project ownership."
        ),
      },
      {
        title: i18n._("Negotiate senior-level compensation"),
        imageUrl: "https://i.pinimg.com/736x/c9/aa/a4/c9aaa488b0a462ac6c16721d0b9c428f.jpg",
        description: i18n._(
          "Build confidence to discuss equity, benefits, and salary packages that match your experience."
        ),
      },
    ],
  };
};

export const getFirstScreenSection = (lang: SupportedLanguage): FirstScreenSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "firstScreen",
    bgImageUrl: "/interview/bg1.webp",
    title: i18n._("Mock Frontend Interviews with AI to Get Senior-Level Offers"),
    subTitle: i18n._(
      "Practice real senior frontend interviews, fix critical gaps, and walk into interviews confident and prepared."
    ),
    label: i18n._("Senior Frontend Developer"),
    buttonTitle: i18n._("Start Your Interview Test"),
  };
};

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
