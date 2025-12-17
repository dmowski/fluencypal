import { TextListSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getWhoIsThisForSection = (lang: SupportedLanguage): TextListSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "textList",
    title: i18n._("Who this is for"),
    subTitle: i18n._("Designed specifically for experienced frontend engineers"),
    textList: [
      i18n._("Senior Frontend Developers preparing for promotions or new roles"),
      i18n._("Frontend engineers interviewing for Senior, Lead, or Staff positions"),
      i18n._("React, Vue, or Angular specialists facing architecture and system design rounds"),
      i18n._(
        "Engineers switching from mid-level to senior roles and needing stronger behavioral stories"
      ),
      i18n._(
        "Developers targeting product companies with complex frontends and high performance requirements"
      ),
      i18n._(
        "Candidates who already know the basics but struggle to articulate decisions clearly in interviews"
      ),
    ],
  };
};
