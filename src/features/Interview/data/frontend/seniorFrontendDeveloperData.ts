import { InterviewData } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { getSeniorFrontendDeveloperQuizData } from "./quizData";
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
import { getWhoIsThisForSection } from "./whoIsThisForSection";
import { getDemoSnippetSection } from "./demoSnippetSection";

export const getSeniorFrontendDeveloperData = (lang: SupportedLanguage): InterviewData => {
  const i18n = getI18nInstance(lang);

  return {
    coreData: {
      id: "senior-frontend-developer",
      jobTitle: i18n._("Senior Frontend Developer"),
      title: i18n._("Senior Frontend Developer interview prep that gets you more offers"),
      subTitle: i18n._(
        "Practice real Senior Frontend Developer interview questions and get a personalized action plan to address your gaps before the next interview."
      ),
      keywords: [
        i18n._("senior frontend interview"),
        i18n._("senior frontend developer interview"),
        i18n._("frontend developer interview prep"),
        i18n._("react interview questions"),
        i18n._("frontend system design interview"),
        i18n._("web developer interview preparation"),
      ],
      category: {
        categoryTitle: i18n._("IT & Software Development"),
        categoryId: "it",
      },
    },

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

    quiz: getSeniorFrontendDeveloperQuizData(lang),
  };
};
