import { ExampleQuestionsSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";
import { getBackendTechData } from "./techData";

export const getBackendExampleQuestionsSection = (
  lang: SupportedLanguage
): ExampleQuestionsSection => {
  const i18n = getI18nInstance(lang);
  const tech = getBackendTechData(lang);

  return {
    type: "exampleQuestions",
    title: i18n._("Questions you will practice"),
    subTitle: i18n._("Real C# Backend Developer interview questions you're likely to be asked"),
    questions: [
      {
        question: i18n._(
          "Design a high-throughput REST API in ASP.NET Core with proper validation, authentication, and rate limiting."
        ),
        techItems: [tech["aspnet-core"]],
      },
      {
        question: i18n._(
          "Explain EF Core change tracking and when to use AsNoTracking for read-heavy endpoints."
        ),
        techItems: [tech["ef-core"]],
      },
      {
        question: i18n._(
          "How would you implement idempotency for POST endpoints to avoid duplicates in distributed systems?"
        ),
        techItems: [tech["system-design"], tech.redis],
      },
      {
        question: i18n._(
          "Describe strategies to handle concurrency in .NET when processing background jobs (queues, batching, throttling)."
        ),
        techItems: [tech.dotnet, tech.queues],
      },
      {
        question: i18n._("How do you choose SQL isolation levels for order placement and why?"),
        techItems: [tech.sql],
      },
      {
        question: i18n._(
          "Sketch a simple microservice architecture with API gateway, auth, services, and async communication."
        ),
        techItems: [tech["system-design"], tech["aspnet-core"]],
      },
    ],
  };
};
