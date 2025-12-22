import { DemoSnippetSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getDemoSnippetSection = (lang: SupportedLanguage): DemoSnippetSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "demoSnippet",
    title: i18n._("See the type of feedback you'll get"),
    subTitle: i18n._("Precise, actionable insights instead of generic comments"),
    demoItems: [
      {
        question: i18n._("What is the difference between var, let, and const in JavaScript?"),
        userAnswerShort: i18n._("var is function scoped and let and const are block scoped."),
        feedback: i18n._(
          "Good start! You correctly identified the scoping difference. To strengthen your answer for a junior role, add these points: var allows redeclaration and hoisting behavior (initialized as undefined), let prevents redeclaration in the same scope, and const also requires initialization and prevents reassignment (though objects/arrays can still be mutated). Mention that const and let are preferred in modern JavaScript. This shows you understand not just what, but why and when to use each."
        ),
      },
      {
        question: i18n._("How do you center a div both horizontally and vertically using CSS?"),
        userAnswerShort: i18n._("I would use margin: auto on the div."),
        feedback: i18n._(
          "margin: auto only centers horizontally, not vertically. For a junior frontend role, you should know modern solutions: Flexbox (display: flex; justify-content: center; align-items: center on the parent), CSS Grid (place-items: center), or absolute positioning with transform (position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%)). Explain which method you'd prefer and why—this shows you understand trade-offs and current best practices."
        ),
      },
    ],
  };
};
