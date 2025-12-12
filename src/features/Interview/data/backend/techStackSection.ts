import { TechStackSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getBackendTechStackSection = (lang: SupportedLanguage): TechStackSection => {
  const i18n = getI18nInstance(lang);

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
        items: [
          { label: ".NET", logoUrl: "https://cdn.simpleicons.org/dotnet/512BD4" },
          { label: "ASP.NET Core", logoUrl: "https://cdn.simpleicons.org/dotnet/512BD4" },
          { label: "EF Core", logoUrl: "https://cdn.simpleicons.org/dotnet/512BD4" },
          {
            label: "C#",
            logoUrl: "https://upload.wikimedia.org/wikipedia/commons/b/bd/Logo_C_sharp.svg",
          },
        ],
      },
      {
        groupTitle: i18n._("Data & Storage"),
        items: [
          {
            label: "SQL",
            logoUrl:
              "https://upload.wikimedia.org/wikipedia/commons/8/87/Sql_data_base_with_logo.png",
          },
          { label: "NoSQL", logoUrl: "https://cdn.simpleicons.org/mongodb/47A248" },
          { label: "Redis", logoUrl: "https://cdn.simpleicons.org/redis/DC382D" },
          { label: "Queues", logoUrl: "/interview/apachekafka.png" },
        ],
      },
      {
        groupTitle: i18n._("Architecture & Resiliency"),
        items: [
          { label: "System Design", logoUrl: "https://cdn.simpleicons.org/diagramsdotnet/F08705" },
          { label: "Circuit Breaker", logoUrl: "https://cdn.simpleicons.org/cloudflare/F38020" },
          { label: "Retry & Backoff", logoUrl: "https://cdn.simpleicons.org/apacheairflow/017CEE" },
          { label: "Logging/Tracing", logoUrl: "https://cdn.simpleicons.org/grafana/F46800" },
        ],
      },
      {
        groupTitle: i18n._("Testing & Quality"),
        items: [
          { label: "Unit Tests", logoUrl: "https://cdn.simpleicons.org/jest/C21325" },
          {
            label: "Integration Tests",
            logoUrl:
              "https://cdn.brandfetch.io/idIq_kF0rb/w/400/h/400/theme/dark/icon.jpeg?c=1bxid64Mup7aczewSAYMX&t=1667565306852",
          },
          { label: "Contract Tests", logoUrl: "https://cdn.simpleicons.org/postman/FF6C37" },
        ],
      },
    ],
  };
};
