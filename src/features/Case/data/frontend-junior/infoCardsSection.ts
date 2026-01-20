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
        title: i18n._("Master fundamental technical questions"),
        description: i18n._(
          "Demonstrate solid understanding of HTML, CSS, JavaScript, and modern frameworks like React or Vue.",
        ),
      },
      {
        iconName: "sparkles",
        title: i18n._("Show problem-solving skills"),
        description: i18n._(
          "Tackle coding challenges, debug issues effectively, and explain your thought process clearly.",
        ),
      },
      {
        iconName: "phone-call",
        title: i18n._("Build confidence in interviews"),
        description: i18n._(
          "Learn to communicate effectively, ask smart questions, and demonstrate your passion for frontend development.",
        ),
      },
      {
        iconName: "trending-up",
        title: i18n._("Launch your frontend career"),
        description: i18n._(
          "Prepare to showcase your portfolio, discuss your learning journey, and secure your first professional role.",
        ),
      },
    ],
  };
};
