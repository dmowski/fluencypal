import { ExampleQuestionsSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { getTechData } from "./techData";

export const getExampleQuestionsSection = (lang: SupportedLanguage): ExampleQuestionsSection => {
  const i18n = getI18nInstance(lang);
  const techData = getTechData(lang);

  return {
    type: "exampleQuestions",
    title: i18n._("Questions you will practice"),
    subTitle: i18n._(
      "Real Senior Frontend Developer interview questions you're likely to be asked"
    ),
    questions: [
      {
        question: i18n._(
          "How would you design the frontend architecture for a large-scale dashboard with real-time data updates?"
        ),
        techItems: [
          techData.typescript,
          techData["frontend-system-design"],
          techData["state-management"],
        ],
      },
      {
        question: i18n._("Explain how React reconciliation works and how it affects performance."),
        techItems: [techData["react-nextjs"], techData["rendering-performance"]],
      },
      {
        question: i18n._(
          "How would you structure state management for a complex application with nested components and async data?"
        ),
        techItems: [techData["state-management"], techData["react-nextjs"], techData["vue-pinia"]],
      },
      {
        question: i18n._(
          "Describe how you would diagnose and fix a performance regression caused by excessive re-renders."
        ),
        techItems: [
          techData["rendering-performance"],
          techData["react-nextjs"],
          techData["angular-rxjs"],
        ],
      },
      {
        question: i18n._(
          "How do you design a reusable component library shared across multiple products or teams?"
        ),
        techItems: [techData["component-libraries"], techData.typescript, techData["react-nextjs"]],
      },
      {
        question: i18n._(
          "Walk me through how you would improve Core Web Vitals for a slow single-page application."
        ),
        techItems: [
          techData["core-web-vitals"],
          techData["performance-metrics"],
          techData["rendering-performance"],
        ],
      },
      {
        question: i18n._(
          "How do you handle error boundaries and fallback UI in modern frontend frameworks?"
        ),
        techItems: [techData["react-nextjs"], techData["vue-pinia"], techData["angular-rxjs"]],
      },
      {
        question: i18n._(
          "Describe a time you led a frontend refactor or migration (e.g., from class components to hooks or from a legacy stack to a modern framework)."
        ),
        techItems: [techData["react-nextjs"], techData["vue-pinia"], techData["angular-rxjs"]],
      },
    ],
  };
};
