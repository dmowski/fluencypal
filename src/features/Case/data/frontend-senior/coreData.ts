import { InterviewCoreData } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getCoreData = (lang: SupportedLanguage): InterviewCoreData => {
  const i18n = getI18nInstance(lang);

  return {
    id: "senior-frontend-developer",
    jobTitle: i18n._("Senior Frontend Developer"),
    title: i18n._(
      "Mock Frontend Interviews with AI to Get Senior-Level Offers",
    ),
    subTitle: i18n._(
      "Practice real senior frontend interviews, fix critical gaps, and walk into interviews confident and prepared.",
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
  };
};
