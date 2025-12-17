import { WebcamDemoSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getWebcamDemoSection = (lang: SupportedLanguage): WebcamDemoSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "webcamDemo",
    title: i18n._("Prepare answers ahead of time"),
    subTitle: i18n._(
      "Get instant feedback on clarity, confidence, and content to refine your responses before the big day."
    ),
    content: i18n._(
      "Simulate real interview conditions by practicing with our app. Build confidence and improve your communication skills in a low-stakes environment."
    ),
    infoList: [
      {
        title: i18n._("Practice speaking clearly and confidently"),
        iconName: "mic",
        iconColor: "#c2c2c2",
      },
      {
        title: i18n._("Receive AI feedback on your answers"),
        iconName: "message-circle",
        iconColor: "#c2c2c2",
      },
      {
        title: i18n._("Improve your communication skills"),
        iconName: "chart-bar",
        iconColor: "#c2c2c2",
      },
    ],
    webCamPreview: {
      videoUrl: "/interview/interviewWebPreview.webm",
      title: i18n._("Tech Interview"),
      participants: i18n._("4 participants"),

      beforeSectionTitle: i18n._("Screening"),
      beforeSectionSubTitle: i18n._("Done"),

      afterSectionTitle: i18n._("System Design"),
      afterSectionSubTitle: i18n._("Next"),
    },
    buttonTitle: i18n._("Join the mock interview"),
  };
};
