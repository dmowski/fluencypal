import { FaqSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getBackendFaqSection = (lang: SupportedLanguage): FaqSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "faq",
    title: i18n._("FAQ"),
    subTitle: i18n._("Backend-focused answers"),
    faqItems: [
      {
        question: i18n._("What kinds of backend interviews can I practice for?"),
        answer: i18n._(
          "Senior and lead backend roles focused on .NET, APIs, data modeling, concurrency, resiliency, and system design."
        ),
      },
      {
        question: i18n._("Do you cover databases and transactions?"),
        answer: i18n._(
          "Yes. You'll practice SQL vs NoSQL decisions, isolation levels, EF Core tips, caching, and data consistency patterns."
        ),
      },
      {
        question: i18n._("Is there content on resiliency and observability?"),
        answer: i18n._(
          "You get scenarios on retries, circuit breakers, timeouts, fallbacks, logging, tracing, and metrics to keep services reliable."
        ),
      },
      {
        question: i18n._("How flexible is the practice?"),
        answer: i18n._(
          "You can emphasize APIs, databases, or system design, and repeat answers with instant AI feedback anytime."
        ),
      },
    ],
  };
};
