import { InfoCardsSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getBackendInfoCardsSection = (lang: SupportedLanguage): InfoCardsSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "infoCards",
    title: i18n._("What you will achieve"),
    subTitle: i18n._("Backend outcomes that transform your interview performance"),
    buttonTitle: i18n._("Start Your Interview Test"),
    infoCards: [
      {
        iconName: "server",
        title: i18n._("Master API and service design"),
        description: i18n._(
          "Explain REST, versioning, idempotency, and resiliency patterns with clarity."
        ),
      },
      {
        iconName: "database",
        title: i18n._("Show strong data fundamentals"),
        description: i18n._(
          "Choose isolation levels, model aggregates, and write efficient queries."
        ),
      },
      {
        iconName: "cpu",
        title: i18n._("Handle concurrency confidently"),
        description: i18n._(
          "Use queues, batching, throttling, and proper synchronization primitives."
        ),
      },
      {
        iconName: "layers",
        title: i18n._("Communicate system design trade-offs"),
        description: i18n._(
          "Discuss scaling, observability, failure modes, and operational readiness."
        ),
      },
    ],
  };
};
