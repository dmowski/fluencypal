import { InfoCardsSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getInfoCardsSection = (
  lang: SupportedLanguage,
): InfoCardsSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "infoCards",
    title: i18n._("What you will achieve"),
    subTitle: i18n._("Real outcomes that transform your interview performance"),
    buttonTitle: i18n._("Start Your Interview Test"),
    infoCards: [
      {
        iconName: "message-square",
        title: i18n._("Master technical leadership questions"),
        description: i18n._(
          "Demonstrate expertise in architecture decisions, code reviews, and mentoring junior developers.",
        ),
      },
      {
        iconName: "sparkles",
        title: i18n._("Showcase system design thinking"),
        description: i18n._(
          "Articulate scalable solutions, performance optimization, and frontend architecture patterns.",
        ),
      },
      {
        iconName: "phone-call",
        title: i18n._("Stand out in behavioral rounds"),
        description: i18n._(
          "Share compelling stories about cross-team collaboration, conflict resolution, and project ownership.",
        ),
      },
      {
        iconName: "trending-up",
        title: i18n._("Negotiate senior-level compensation"),
        description: i18n._(
          "Build confidence to discuss equity, benefits, and salary packages that match your experience.",
        ),
      },
    ],
  };
};
