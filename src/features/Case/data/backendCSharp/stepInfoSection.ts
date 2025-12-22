import { StepInfoCardSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getBackendStepInfoSection = (lang: SupportedLanguage): StepInfoCardSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "stepInfoCard",
    title: i18n._("Why backend candidates improve fast"),
    subTitle: i18n._("A method focused on clarity and reliability"),
    stepInfoCards: [
      {
        iconName: "video",
        label: i18n._("Step 1"),
        title: i18n._("Real interview simulation"),
        description: i18n._("Practice API and system design scenarios."),
      },
      {
        iconName: "brain",
        label: i18n._("Step 2"),
        title: i18n._("AI feedback that matters"),
        description: i18n._("Improve architecture, data, and resiliency answers."),
      },
      {
        iconName: "file-text",
        label: i18n._("Step 3"),
        title: i18n._("Personalized scripts"),
        description: i18n._("Tailored to your experience and target role."),
      },
    ],
  };
};
