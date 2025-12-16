import { FaqSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getFaqSection = (lang: SupportedLanguage): FaqSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "faq",
    title: i18n._("FAQ"),
    subTitle: i18n._("Your questions answered"),
    faqItems: [
      {
        question: i18n._("What types of frontend interviews can I practice for?"),
        answer: i18n._(
          "You can practice for senior frontend, lead, and staff-level interviews including technical rounds, frontend system design, live coding, and behavioral interviews focused on React, Vue, Angular, TypeScript, and modern web architecture."
        ),
      },
      {
        question: i18n._("How does the AI feedback work?"),
        answer: i18n._(
          "Our AI evaluates your answers for technical depth (architecture, performance, state management), clarity, structure, and communication. You receive concrete suggestions on what to add, remove, or reframe to sound like a strong senior frontend engineer."
        ),
      },
      {
        question: i18n._("Can I customize my practice sessions?"),
        answer: i18n._(
          "Yes. You can tailor sessions to your target role, tech stack (React, Vue, Angular, etc.), and seniority level. You can also focus on specific areas like system design, performance optimization, or behavioral questions."
        ),
      },
      {
        question: i18n._("Do I need to schedule time with a real interviewer?"),
        answer: i18n._(
          "No. All sessions are on-demand. You can practice anytime with AI-powered mock interviews, review feedback immediately, and repeat questions as often as you want."
        ),
      },
    ],
  };
};
