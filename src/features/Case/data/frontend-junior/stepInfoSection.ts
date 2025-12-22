import { StepInfoCardSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getStepInfoSection = (lang: SupportedLanguage): StepInfoCardSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "stepInfoCard",
    title: i18n._("Why candidates improve so quickly"),
    subTitle: i18n._("A proven method that delivers measurable results"),
    stepInfoCards: [
      {
        iconName: "video",
        label: i18n._("Step 1"),
        title: i18n._("Real interview simulation"),
        description: i18n._("Practice in real interview conditions — no tutors needed."),
      },
      {
        iconName: "brain",
        label: i18n._("Step 2"),
        title: i18n._("AI feedback that matters"),
        description: i18n._("Improve your impact, structure, clarity, and delivery."),
      },
      {
        iconName: "file-text",
        label: i18n._("Step 3"),
        title: i18n._("Personalized answer scripts"),
        description: i18n._("Based on your CV, experience, and target role."),
      },
    ],
  };
};
