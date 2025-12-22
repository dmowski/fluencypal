import { TextListSection } from "../../types";
import { SupportedLanguage } from "@/features/Lang/lang";
import { getI18nInstance } from "@/appRouterI18n";

export const getPainSection = (lang: SupportedLanguage): TextListSection => {
  const i18n = getI18nInstance(lang);

  return {
    type: "textList",
    title: i18n._("Landing Your First Dev Job Is Harder Than It Should Be"),
    subTitle: i18n._(
      "You've learned to code, but interviews test much more than just syntax and tutorials."
    ),
    textList: [
      {
        title: i18n._(
          "You can build projects, but **don't know what interviewers actually want to see**"
        ),
        iconName: "circle-question-mark",
        iconColor: "#c2c2c2",
      },
      {
        title: i18n._(
          "Code challenges feel different from **real development work** you've practiced"
        ),
        iconName: "circle-question-mark",
        iconColor: "#c2c2c2",
      },
      {
        title: i18n._("You're unsure how to **explain your thinking process** while coding"),
        iconName: "circle-question-mark",
        iconColor: "#c2c2c2",
      },
      {
        title: i18n._("Behavioral questions feel **scripted and uncomfortable**"),
        iconName: "circle-question-mark",
        iconColor: "#c2c2c2",
      },
      {
        title: i18n._(
          `Feedback is vague: "**not enough experience**" — but how do you get experience without a job?`
        ),
        iconName: "circle-question-mark",
        iconColor: "#c2c2c2",
      },
      {
        title: i18n._("You're not sure what **salary to ask for** or how to negotiate"),
        iconName: "circle-question-mark",
        iconColor: "#c2c2c2",
      },
    ],
  };
};
