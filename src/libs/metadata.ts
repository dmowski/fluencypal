import "server-only";

import { getI18nInstance } from "@/appRouterI18n";
import { supportedLanguages } from "@/common/lang";
import { robots, siteUrl } from "@/common/metadata";
import { APP_NAME } from "@/features/Landing/landingSettings";
import { initLingui } from "@/initLingui";
import { getRolePlayScenarios } from "@/features/RolePlay/rolePlayData";
import { getBlogs } from "@/features/Blog/blogData";

export const generateAlternatesTags = (currentPath: string) => {
  let hreflangLinks: Record<string, string> = {};
  supportedLanguages.forEach((lang) => {
    hreflangLinks[lang] =
      `${siteUrl}${lang === "en" ? "" : lang + (currentPath ? "/" : "")}${currentPath}`;
  });

  return {
    canonical: hreflangLinks["en"],
    languages: {
      ...hreflangLinks,
      "x-default": hreflangLinks["en"], // Use the English version of the current page
    },
  };
};

interface generateMetadataInfoProps {
  lang: string;
  currentPath: string;
  scenarioId?: string;
  blogId?: string;
  category?: string;
  rolePlayId?: string;
}

export const generateMetadataInfo = ({
  lang,
  currentPath,
  scenarioId,
  blogId,
  category,
  rolePlayId,
}: generateMetadataInfoProps) => {
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);
  let keywords: string[] = [];

  const i18n = getI18nInstance(supportedLang);
  const langForUrl = supportedLang === "en" ? "" : supportedLang + "/";

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
      `Get flexible pricing with FluencyPal. Start with free credits, pay-as-you-go, and enjoy AI-powered language practice with no subscriptions or hidden fees.`
    );
    keywords = [
      i18n._(`AI language tutor pricing`),
      i18n._(`pay-as-you-go language learning`),
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

  if (currentPath === "terms") {
    title = i18n._(`Terms of Use`) + " | " + APP_NAME;
    description = i18n._(
      `Experience next-level language practice with Bruno, your friendly AI tutor. Whether you're a beginner or advanced learner, Bruno adapts to your pace, corrects mistakes, and keeps you motivated.`
    );
    keywords = [];
  }

  if (currentPath === "scenarios" && !scenarioId) {
    title =
      i18n._(`Real-Life English Role-Play Scenarios`) +
      (category ? " - " + category : "") +
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
    title = i18n._(`Learning Blog`) + (category ? " - " + category : "") + " | " + APP_NAME;
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
    const blogs = getBlogs(supportedLang);
    const blog = blogs.find((b) => b.id === blogId);

    title =
      `${blog?.title || "Blog"} - ` + i18n._(`Practice English Conversation with AI | FluencyPal`);
    description = blog?.subTitle || "";
    keywords = blog?.keywords || [];
    openGraphImageUrl = blog?.imagePreviewUrl || openGraphImageUrl;
  }

  if (currentPath === "scenarios" && scenarioId) {
    const rolePlayScenarios = getRolePlayScenarios(supportedLang);
    const scenario = rolePlayScenarios.find((s) => s.id === scenarioId);

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

  const id = scenarioId || blogId;
  const pathWithId = currentPath + (id ? "/" + id : "");

  const query = [
    category ? "category=" + encodeURIComponent(category) : "",
    rolePlayId ? "rolePlayId=" + encodeURIComponent(rolePlayId) : "",
  ]
    .filter(Boolean)
    .join("&");

  const pathWithQueries = pathWithId + (query ? "?" + query : "");
  return {
    keywords,
    title,
    description,
    alternates: generateAlternatesTags(pathWithQueries),
    openGraph: {
      title: title,
      description: description,
      url: `${siteUrl}${langForUrl}/${pathWithQueries}`,
      images: [
        {
          url: openGraphImageUrl,
          width: 1200,
          height: 630,
          alt: `${APP_NAME} – ` + i18n._(`AI English Speaking Practice`),
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [openGraphImageUrl],
      creator: "@dmowskii",
    },

    robots: robots,
  };
};
