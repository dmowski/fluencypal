import { TextListSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getWhoIsThisForSection = (
  lang: SupportedLanguage,
): TextListSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "textList",
    title: i18n._("Who this is for"),
    subTitle: i18n._(
      "Designed specifically for aspiring and junior frontend engineers",
    ),
    textList: [
      {
        title: i18n._(
          "Recent graduates or bootcamp alumni entering frontend development",
        ),
      },
      {
        title: i18n._(
          "Junior developers preparing for their first professional frontend role",
        ),
      },
      {
        title: i18n._(
          "Self-taught developers looking to validate their HTML, CSS, and JavaScript knowledge",
        ),
      },
      {
        title: i18n._(
          "Professionals transitioning from other fields into frontend engineering",
        ),
      },
      {
        title: i18n._(
          "Entry-level candidates targeting startups or agencies with modern web development stacks",
        ),
      },
      {
        title: i18n._(
          "Beginners who understand basic concepts but need help presenting themselves confidently in interviews",
        ),
      },
    ],
  };
};
