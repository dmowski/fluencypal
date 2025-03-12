import { allMessages, getI18nInstance } from "@/appRouterI18n";
import { supportedLanguages } from "@/common/lang";
import { siteUrl } from "@/common/metadata";
import LandingPage from "@/features/Landing/LandingPage";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";
import { initLingui } from "@/initLingui";
import { Metadata } from "next";
import { Robots } from "next/dist/lib/metadata/types/metadata-types";
import { OpenGraph } from "next/dist/lib/metadata/types/opengraph-types";
import { Twitter } from "next/dist/lib/metadata/types/twitter-types";
import linguiConfig from "../../../lingui.config";
import { CookiesPopup } from "@/features/Legal/CookiesPopup";

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams() {
  return linguiConfig.locales.map((lang: string) => ({ lang }));
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const lang = params.lang;
  console.log("generateMetadata", lang);
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);

  const i18n = getI18nInstance(supportedLang);

  const openGraph: OpenGraph = {
    title: i18n._(`FluencyPal – AI English Speaking Practice`),
    description: i18n._(
      `Practice conversational English anytime with FluencyPal, your personal AI English tutor. Improve fluency, pronunciation, and confidence through realistic, immersive conversations.`
    ),
    url: siteUrl + lang + "/",
    images: [
      {
        url: `${siteUrl}openGraph.png`,
        width: 1200,
        height: 630,
        alt: i18n._(`FluencyPal - AI English Speaking Practice App`),
      },
    ],
    locale: "en_US",
    type: "website",
  };

  const twitter: Twitter = {
    card: "summary_large_image",
    title: i18n._(`FluencyPal – Your AI English Speaking Partner`),
    description: i18n._(
      `FluencyPal helps intermediate and advanced learners improve English speaking fluency through personalized AI-driven conversations. Available 24/7, no subscriptions required.`
    ),
    images: [`${siteUrl}openGraph.png`],
    creator: "@dmowskii",
  };

  const robots: Robots = {
    index: true,
    follow: true,
  };

  const metadata: Metadata = {
    title: i18n._(`FluencyPal – AI English Speaking Practice for Fluency & Confidence`),
    description: i18n._(
      `Practice conversational English with FluencyPal, your 24/7 AI English tutor and speaking coach. Improve fluency, pronunciation, and confidence through real-life role-play scenarios with instant feedback.`
    ),

    alternates: {
      canonical: `https://www.fluencypal.com/${lang ? supportedLang : ""}`,
    },

    keywords: [
      i18n._(`ai English tutor`),
      i18n._(`English speaking practice app`),
      i18n._(`improve English fluency`),
      i18n._(`advanced English conversation`),
      i18n._(`English speaking coach`),
      i18n._(`conversational English practice`),
      i18n._(`language immersion app`),
      i18n._(`English speaking partner`),
    ],
    openGraph: openGraph,
    twitter: twitter,
    robots: robots,
  };

  return metadata;
}

export default async function Page(props: { params: Promise<{ lang: string }> }) {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);

  const i18n = getI18nInstance(supportedLang);

  return (
    <LinguiClientProvider initialLocale={lang} initialMessages={allMessages[lang]!}>
      <LandingPage lang={supportedLang} />
      <CookiesPopup
        message={i18n._(
          `We use cookies to ensure that we give you the best experience on our website. If you continue to use this site we will assume that you are happy with it`
        )}
        ok={i18n._("Ok")}
        no={i18n._("No")}
        privacy={i18n._("Privacy Policy")}
        lang={supportedLang}
      />
    </LinguiClientProvider>
  );
}
