import { TechStackSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { getBackendTechData } from "./techData";

export const getBackendTechStackSection = (
  lang: SupportedLanguage,
): TechStackSection => {
  const i18n = getI18nInstance(lang);
  const tech = getBackendTechData(lang);

  return {
    type: "techStack",
    title: i18n._("Tech stack covered"),
    subTitle: i18n._("Tailored practice for backend and system design"),
    keyPoints: [
      i18n._("Questions matched to your backend stack"),
      i18n._("Real-world API and data scenarios"),
      i18n._("Performance, resiliency, and architecture patterns"),
      i18n._("Focus on shipping reliable services"),
    ],
    techGroups: [
      {
        groupTitle: i18n._(".NET & Frameworks"),
        items: [tech.dotnet, tech["aspnet-core"], tech["ef-core"], tech.csharp],
      },
      {
        groupTitle: i18n._("Data & Storage"),
        items: [tech.sql, tech.nosql, tech.redis, tech.queues],
      },
      {
        groupTitle: i18n._("Architecture & Resiliency"),
        items: [
          tech["system-design"],
          tech["circuit-breaker"],
          tech["retry-backoff"],
          tech.observability,
        ],
      },
      {
        groupTitle: i18n._("Testing & Quality"),
        items: [
          tech["unit-tests"],
          tech["integration-tests"],
          tech["contract-tests"],
        ],
      },
    ],
  };
};
