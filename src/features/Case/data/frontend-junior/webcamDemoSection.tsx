import { WebcamDemoSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getWebcamDemoSection = (
  lang: SupportedLanguage,
): WebcamDemoSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "webcamDemo",
    title: i18n._("Practice Interview Answers Before It Matters"),
    subTitle: i18n._(
      "Get instant AI feedback on structure, clarity, and senior-level reasoning — before the real interview.",
    ),
    content: i18n._(
      "Simulate real frontend interviews and practice explaining your decisions under pressure — without risking a real offer.",
    ),
    infoList: [
      {
        title: i18n._("Explain trade-offs like a senior"),
        iconName: "mic",
        iconColor: "#c2c2c2",
      },
      {
        title: i18n._("Get clear, actionable AI feedback"),
        iconName: "message-circle",
        iconColor: "#c2c2c2",
      },
      {
        title: i18n._("Communicate experience with confidence"),
        iconName: "chart-bar",
        iconColor: "#c2c2c2",
      },
    ],
    webCamPreview: {
      videoUrl: "/interview/interviewWebPreview2.webm",
      title: i18n._("Tech Interview"),
      participants: i18n._("4 participants"),

      beforeSectionTitle: i18n._("Screening"),
      beforeSectionSubTitle: i18n._("Done"),

      afterSectionTitle: i18n._("System Design"),
      afterSectionSubTitle: i18n._("Next"),
    },
    buttonTitle: i18n._("Start a mock interview"),
  };
};
