import "server-only";

import { getI18nInstance } from "@/appRouterI18n";
import { SupportedLanguage, supportedLanguages } from "@/features/Lang/lang";
import { siteUrl } from "@/common/metadata";
import { APP_NAME } from "@/features/Landing/landingSettings";
import { initLingui } from "@/initLingui";
import { getRolePlayScenarios } from "@/features/RolePlay/rolePlayData";
import { getBlogs } from "@/features/Blog/blogData";
import { getLangLearnPlanLabels } from "@/features/Lang/getLabels";
import { getAllInterviews } from "../Interview/data";

type Path =
  | "contacts"
  | "quiz"
  | "quiz2"
  | "tg-app"
  | "practice"
  | "pricing"
  | "privacy"
  | "cookies"
  | "terms"
  | "scenarios"
  | "blog"
  | "interviewLanding"
  | "interview"
  | "";

interface generateMetadataInfoProps {
  lang: string;
  currentPath: Path;
  scenarioId?: string;
  interviewId?: string;
  blogId?: string;
  category?: string;
  rolePlayId?: string;
  languageToLearn?: SupportedLanguage;
}

export const generateMetadataInfo = ({
  lang,
  currentPath,
  scenarioId,
  blogId,
  category,
  rolePlayId,
  languageToLearn,
  interviewId,
}: generateMetadataInfoProps) => {
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);
  let keywords: string[] = [];

  const i18n = getI18nInstance(supportedLang);
  let needIndex = true;

  let openGraphImageUrl = `${siteUrl}openGraph.png`;
  let title = "";
  let description = "";
  if (currentPath === "contacts") {
    title = i18n._(`Contacts`) + " | " + APP_NAME;
    description = i18n._(
      `Get in touch with the FluencyPal for any inquiries, support, or feedback.`
    );
    keywords = [];
  }

  if (currentPath === "quiz") {
    const languageLearningMap = getLangLearnPlanLabels(supportedLang);
    const languageToLearnPlan = languageLearningMap[languageToLearn || "en"];
    title = languageToLearnPlan + " | " + APP_NAME;
    description = i18n._(
      `Create a personalized language learning plan with FluencyPal. Set your fluency goals, focus on specific skills like speaking or listening, and track your progress to master English effectively.`
    );
    keywords = [];
  }

  if (currentPath === "interviewLanding") {
    title = i18n._(`Interview Preparation`) + " | " + APP_NAME;
    description = i18n._(
      `Prepare for your interviews with AI-powered tools that help you practice and improve your answers.`
    );
    keywords = [];
    needIndex = false;
  }

  if (currentPath === "quiz2") {
    const languageLearningMap = getLangLearnPlanLabels(supportedLang);
    const languageToLearnPlan = languageLearningMap[languageToLearn || "en"];
    title = languageToLearnPlan + " | " + APP_NAME;
    description = i18n._(
      `Create a personalized language learning plan with FluencyPal. Create your goal, focus on specific skills like speaking or listening.`
    );
    keywords = [];
  }

  if (currentPath === "tg-app") {
    const languageLearningMap = getLangLearnPlanLabels(supportedLang);
    const languageToLearnPlan = languageLearningMap[languageToLearn || "en"];
    title = languageToLearnPlan + " | " + " Telegram Mini App " + APP_NAME;
    description = i18n._(
      `Create a personalized language learning plan with FluencyPal. Set your fluency goals, focus on specific skills like speaking or listening, and track your progress to master English effectively.`
    );
    keywords = [];
  }

  if (currentPath === "practice") {
    title = i18n._(`Practice`) + " | " + APP_NAME;
    description = i18n._(
      `Experience next-level language practice with Bruno, your friendly AI tutor. Whether you're a beginner or advanced learner, Bruno adapts to your pace, corrects mistakes, and keeps you motivated.`
    );
    keywords = [
      i18n._(`AI language tutor pricing`),
      i18n._(`Online English`),
      i18n._(`Learn English`),
      i18n._(`AI Language Tutor`),
      i18n._(`English Practice`),
      APP_NAME,
      i18n._(`Language Learning`),
    ];
  }

  if (currentPath === "pricing") {
    title = i18n._(`Affordable AI Language Learning`) + " | " + APP_NAME;
    description = i18n._(
      `Get flexible pricing with FluencyPal. Start with 3 free days, and enjoy AI-powered language practice with no subscriptions or hidden fees.`
    );
    keywords = [
      i18n._(`AI language tutor pricing`),
      i18n._(`subscription plans`),
      i18n._(`online English pricing`),
      i18n._(`AI tutor cost`),
    ];
  }

  if (currentPath === "privacy") {
    title = i18n._(`Privacy Policy`) + " | " + APP_NAME;
    description = i18n._(
      `Experience next-level language practice with Bruno, your friendly AI tutor. Whether you're a beginner or advanced learner, Bruno adapts to your pace, corrects mistakes, and keeps you motivated.`
    );
    keywords = [];
  }

  if (currentPath === "cookies") {
    title = i18n._(`Cookies Policy`) + " | " + APP_NAME;
    description = i18n._(
      `Experience next-level language practice with Bruno, your friendly AI tutor. Whether you're a beginner or advanced learner, Bruno adapts to your pace, corrects mistakes, and keeps you motivated.`
    );
    keywords = [];
  }

  if (currentPath === "terms") {
    title = i18n._(`Terms of Use`) + " | " + APP_NAME;
    description = i18n._(
      `Experience next-level language practice with Bruno, your friendly AI tutor. Whether you're a beginner or advanced learner, Bruno adapts to your pace, corrects mistakes, and keeps you motivated.`
    );
    keywords = [];
  }

  if (currentPath === "scenarios" && !scenarioId) {
    let categoryTitle = "";

    if (category) {
      const rolePlayScenarios = getRolePlayScenarios(supportedLang);
      const categoryInfo = rolePlayScenarios.categoriesList.find((c) => c.categoryId === category);
      if (!categoryInfo) {
        needIndex = false;
      }

      categoryTitle = categoryInfo
        ? " - " + categoryInfo.categoryTitle
        : i18n._(`Unknown category`);
    }
    title =
      i18n._(`Real-Life English Role-Play Scenarios`) +
      (categoryTitle ? " - " + categoryTitle : "") +
      " | " +
      APP_NAME;
    description = i18n._(
      `Practice realistic English conversations with FluencyPal’s AI tutor. From job interviews to casual chats, build fluency and confidence through immersive role-play scenarios designed for intermediate and advanced learners.`
    );
    keywords = [
      i18n._(`English Role-Play`),
      i18n._(`English Speaking Practice`),
      i18n._(`AI English Tutor`),
      i18n._(`Advanced English Conversation`),
      i18n._(`Practice English Online`),
      i18n._(`Real-Life English Scenarios`),
      i18n._(`Language Immersion`),
      i18n._(`Fluency Improvement`),
    ];
  }

  if (currentPath === "blog" && !blogId) {
    let categoryTitle = "";

    if (category) {
      const items = getBlogs(supportedLang);
      const categoryInfo = items.categoriesList.find((c) => c.categoryId === category);
      if (!categoryInfo) {
        needIndex = false;
      }
      categoryTitle = categoryInfo
        ? " - " + categoryInfo.categoryTitle
        : i18n._(`Unknown category`);
    }

    title =
      i18n._(`Learning Blog`) + (categoryTitle ? " - " + categoryTitle : "") + " | " + APP_NAME;
    description = i18n._(
      `Read the latest articles on language learning, English practice tips, and AI tutor updates. Stay informed, motivated, and inspired to reach your fluency goals with FluencyPal.`
    );
    keywords = [
      i18n._(`Language Learning Blog`),
      i18n._(`English Practice Tips`),
      i18n._(`AI Tutor Updates`),
      i18n._(`Fluency Goals`),
      i18n._(`Language Learning Resources`),
      i18n._(`English Learning Articles`),
      i18n._(`Language Learning Tips`),
    ];
  }

  if (currentPath === "blog" && blogId) {
    const { blogs } = getBlogs(supportedLang);
    const blog = blogs.find((b) => b.id === blogId);
    if (!blog) {
      needIndex = false;
    }

    title =
      `${blog?.title || "Blog"} - ` + i18n._(`Practice English Conversation with AI | FluencyPal`);
    description = blog?.subTitle || "";
    keywords = blog?.keywords || [];
    openGraphImageUrl = blog?.imagePreviewUrl || openGraphImageUrl;
  }

  if (currentPath === "scenarios" && scenarioId) {
    const rolePlayScenarios = getRolePlayScenarios(supportedLang);
    const scenario = rolePlayScenarios.rolePlayScenarios.find((s) => s.id === scenarioId);

    if (!scenario) {
      needIndex = false;
    }

    title =
      `${scenario?.title || "Scenario"} - ` +
      i18n._(`Practice English Conversation with AI | FluencyPal`);
    description = scenario?.subTitle || "";
    keywords = [
      i18n._(`AI English Tutor`),
      i18n._(`English Role-Play`),
      i18n._(`Conversational English Practice`),
      i18n._(`English Fluency`),
      i18n._(`Advanced English Conversation`),
      i18n._(`Online Language Practice`),
      i18n._(`Language Immersion`),
      i18n._(`Real-Life English Scenarios`),
      i18n._(`English Speaking Exercises`),
    ];

    openGraphImageUrl = scenario?.imageSrc ? `${siteUrl}${scenario.imageSrc}` : openGraphImageUrl;
  }

  if (currentPath === "interview" && !interviewId) {
    let categoryTitle = "";

    if (category) {
      const items = getAllInterviews(supportedLang);
      const categoryInfo = items.categoriesList.find((c) => c.categoryId === category);
      if (!categoryInfo) {
        needIndex = false;
      }
      categoryTitle = categoryInfo
        ? " - " + categoryInfo.categoryTitle
        : i18n._(`Unknown category`);
    }

    title =
      i18n._(`Prepare for the Interview`) +
      (categoryTitle ? " - " + categoryTitle : "") +
      " | " +
      APP_NAME;
    description = i18n._(
      `Prepare for your interviews with AI-powered tools that help you practice and improve your answers.`
    );
    keywords = [
      i18n._(`Prepare for the Interview`),
      i18n._(`Interview Practice`),
      i18n._(`AI Interview Coach`),
      i18n._(`Job Interview Preparation`),
      i18n._(`Mock Interviews`),
      i18n._(`Interview Tips`),
      i18n._(`Career Advancement`),
    ];

    needIndex = false;
  }
  if (currentPath === "interview" && interviewId) {
    const { interviews } = getAllInterviews(supportedLang);
    const item = interviews.find((b) => b.id === interviewId);
    if (!item) {
      needIndex = false;
    }

    title = `${item?.title || "Interview not found"} - ` + i18n._(`| FluencyPal`);
    description = item?.subTitle || "";
    keywords = item?.keywords || [];
    openGraphImageUrl = openGraphImageUrl;
    needIndex = false;
  }

  if (currentPath === "") {
    title = i18n._(`FluencyPal – AI English Speaking Practice for Fluency & Confidence`);
    description = i18n._(
      `Practice conversational English with FluencyPal, your 24/7 AI English tutor and speaking coach. Improve fluency, pronunciation, and confidence through real-life role-play scenarios with instant feedback.`
    );
    keywords = [
      i18n._(`ai English tutor`),
      i18n._(`English speaking practice app`),
      i18n._(`improve English fluency`),
      i18n._(`advanced English conversation`),
      i18n._(`English speaking coach`),
      i18n._(`conversational English practice`),
      i18n._(`language immersion app`),
      i18n._(`English speaking partner`),
    ];
  }

  const id = scenarioId || blogId || interviewId;
  const metadataUrls = getMetadataUrls({
    pagePath: currentPath,
    id,
    queries: {
      category,
      rolePlayId,
    },
    supportedLang,
  });

  return {
    keywords,
    title,
    metadataBase: new URL(siteUrl),
    description,
    alternates: metadataUrls.alternates,
    icons: getMetadataIcons(),
    openGraph: getOpenGraph({
      title,
      description,
      ogUrl: metadataUrls.ogUrl,
      openGraphImageUrl,
      alt: `${APP_NAME} – ` + i18n._(`AI English Speaking Practice`),
    }),
    twitter: getTwitterCard({
      title,
      description,
      openGraphImageUrl,
    }),
    other: {
      google: "notranslate",
    },
    robots: {
      index: needIndex,
      follow: true,
    },
  };
};

export function getMetadataUrls({
  pagePath,
  id,
  queries,
  supportedLang,
}: {
  // examples: contacts, pricing, practice
  pagePath: string;

  // like blogId, scenarioId
  id: string | undefined;

  // example: { category: "business" }
  queries: Record<string, string | undefined>;

  supportedLang: SupportedLanguage;
}) {
  const pathWithId = pagePath + (id ? "/" + id : "");

  const queryList = Object.entries(queries).map(([key, value]) =>
    value ? `${key}=` + encodeURIComponent(value) : ""
  );
  const query = queryList.filter(Boolean).join("&");

  const pathWithQueries = pathWithId + (query ? "?" + query : "");
  const alternates = generateAlternatesTags({
    path: pathWithQueries,
    lang: supportedLang,
  });
  const ogUrl = alternates.languages[supportedLang || "en"];

  return {
    ogUrl,
    alternates,
    pathWithQueries,
  };
}

export function getTwitterCard({
  title,
  description,
  openGraphImageUrl,
}: {
  title: string;
  description: string;
  openGraphImageUrl?: string;
}) {
  const image = openGraphImageUrl || `${siteUrl}openGraph.png`;
  return {
    card: "summary_large_image",
    title: title,
    description: description,
    images: [image],
    creator: "@dmowskii",
  };
}

export function getOpenGraph({
  title,
  description,
  ogUrl,
  openGraphImageUrl,
  alt,
}: {
  title: string;
  description: string;
  ogUrl: string;
  openGraphImageUrl?: string;
  alt: string;
}) {
  const image = openGraphImageUrl || `${siteUrl}openGraph.png`;
  return {
    title: title,
    description: description,
    url: ogUrl,
    images: [
      {
        url: image,
        width: 1200,
        height: 630,
        alt: alt,
      },
    ],
    type: "website",
  };
}

export function getMetadataIcons() {
  return {
    icon: [
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-26x26.png", sizes: "26x26", type: "image/png" },
      { url: "/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/logo192.png" }],
  };
}

export const generateAlternatesTags = ({
  path,
  lang,
}: {
  // Example of currentPath: contacts, blog/123, blog?category=tech
  //  WITHOUT LANGUAGE PREFIX
  path: string;
  lang: SupportedLanguage;
}) => {
  const hreflangLinks = supportedLanguages.reduce((acc, lang) => {
    acc[lang] = `${siteUrl}${lang === "en" ? "" : lang + (path ? "/" : "")}${path}`;

    return acc;
  }, {} as Record<SupportedLanguage, string>);

  return {
    canonical: hreflangLinks[lang],
    languages: {
      ...hreflangLinks,
      "x-default": hreflangLinks["en"], // Use the English version of the current page
    },
  };
};
