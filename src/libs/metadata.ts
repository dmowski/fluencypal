import "server-only";

import { getI18nInstance } from "@/appRouterI18n";
import { supportedLanguages } from "@/common/lang";
import { robots, siteUrl, siteUrlWithoutSlash } from "@/common/metadata";
import { APP_NAME } from "@/features/Landing/landingSettings";
import { initLingui } from "@/initLingui";

export const generateAlternatesTags = (currentPath: string) => {
  let hreflangLinks: Record<string, string> = {};
  supportedLanguages.forEach((lang) => {
    hreflangLinks[lang] = `${siteUrl}${lang === "en" ? "" : lang + "/"}${currentPath}`;
  });

  return {
    canonical: hreflangLinks["en"],
    languages: {
      ...hreflangLinks,
      "x-default": siteUrlWithoutSlash, // Use the English version of the current page
    },
  };
};

interface generateMetadataInfoProps {
  lang: string;
  currentPath: string;
}

export const generateMetadataInfo = ({ lang, currentPath }: generateMetadataInfoProps) => {
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);
  let keywords: string[] = [];

  const i18n = getI18nInstance(supportedLang);
  const langForUrl = supportedLang === "en" ? "" : supportedLang + "/";

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

  return {
    keywords,
    title,
    description,
    alternates: generateAlternatesTags(currentPath),
    openGraph: {
      title: title,
      description: description,
      url: `${siteUrl}${langForUrl}/${currentPath}`,
      images: [
        {
          url: `${siteUrl}openGraph.png`,
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
      images: [`${siteUrl}openGraph.png`],
      creator: "@dmowskii",
    },

    robots: robots,
  };
};
