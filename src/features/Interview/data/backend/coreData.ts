import { InterviewCoreData } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getCsharpBackendDeveloperCoreData = (lang: SupportedLanguage): InterviewCoreData => {
  const i18n = getI18nInstance(lang);

  return {
    id: "csharp-backend-developer",
    jobTitle: i18n._("C# Backend Developer"),
    title: i18n._("C# Backend Developer Interview"),
    subTitle: i18n._(
      "Prepare for .NET, APIs, databases, multithreading, and system design questions."
    ),
    keywords: [
      i18n._("c# backend interview"),
      i18n._(".net interview questions"),
      i18n._("asp.net core interview prep"),
      i18n._("csharp developer interview"),
    ],
    category: {
      categoryTitle: i18n._("IT & Software Development"),
      categoryId: "it",
    },
  };
};
