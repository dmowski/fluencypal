import { SupportedLanguage } from "@/common/lang";
import { BlogPost } from "./types";
import { getI18nInstance } from "@/appRouterI18n";

export const getBlogs: (lang: SupportedLanguage) => Array<BlogPost> = (lang) => {
  const i18n = getI18nInstance(lang);
  return [
    {
      id: "welcome-to-our-blog",
      title: i18n._("Blog post title"),
      subTitle: i18n._("Blog post subtitle"),
      keywords: ["keyword1", "keyword2"],
      content: i18n._(
        `Boost your English vocabulary and fluency by creatively describing and guessing words in this interactive AI-powered Alias game.\n\n## Benefits of Playing *Alias Game*\n- Enhance your vocabulary by describing words in unique ways.\n- Improve listening skills as you interpret descriptions.\n- Practice rapid thinking and fluent speaking under playful pressure.\n- Receive instant, tailored feedback from your AI partner.\n\n## How to Play\nYou and your AI partner alternate turns describing and guessing words without directly naming them. This encourages creative thinking and fluent expression, adapting to your language proficiency.`
      ),
      imagePreviewUrl: "https://cdn.midjourney.com/a26866e1-112d-45bd-a1b0-d6ae78b53ac6/0_2.png",
      publishedAt: Date.now(),
      category: i18n._("Welcome"),
    },
  ];
};
