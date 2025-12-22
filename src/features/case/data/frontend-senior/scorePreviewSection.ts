import { ScorePreviewSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getScorePreviewSection = (lang: SupportedLanguage): ScorePreviewSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "scorePreview",
    title: i18n._("Take the Interview Readiness Test"),
    buttonTitle: i18n._("Start Test"),
    subTitle: i18n._("In less than 5 minutes, you'll get:"),
    infoList: [
      i18n._("Personalized Interview Readiness Score"),
      i18n._("Technical analysis on system design and architecture answers"),
      i18n._("Leadership competency assessment with behavioral response feedback"),
      i18n._("Framework-specific insights (React, Vue, Angular)"),
      i18n._("Strategic action plan to address gaps in frontend architecture knowledge"),
    ],
    scorePreview: {
      label: i18n._("Interview Readiness Score"),
      totalScore: 82,
      description: i18n._(
        "Strong knowledge of React and TypeScript. Slight gaps in communication and leadership answers."
      ),
      scoreMetrics: [
        { title: i18n._("React & TypeScript"), score: 88 },
        { title: i18n._("Coding Skills"), score: 90 },
        { title: i18n._("Problem Solving"), score: 80 },
        { title: i18n._("Communication & Leadership"), score: 70 },
      ],
    },
  };
};
