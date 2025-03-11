import { allMessages } from "@/appRouterI18n";
import { supportedLanguages } from "@/features/Lang/lang";
import { openGraph, robots, siteUrl, twitter } from "@/common/metadata";
import { Header } from "@/features/Header/Header";
import { APP_NAME } from "@/features/Landing/landingSettings";
import { LinguiClientProvider } from "@/features/Lang/LinguiClientProvider";
import { PrivacyPolicy } from "@/features/Legal/PrivacyPolicy";
import { initLingui } from "@/initLingui";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: `Privacy Policy | ${APP_NAME}`,
  description:
    "Experience next-level language practice with Bruno, your friendly AI tutor. Whether you're a beginner or advanced learner, Bruno adapts to your pace, corrects mistakes, and keeps you motivated.",
  keywords: [
    "Online English",
    "Learn English",
    "AI Language Tutor",
    "English Practice",
    "Language Learning",
  ],
  openGraph: { ...openGraph, url: `${siteUrl}privacy` },
  twitter: twitter,
  robots: robots,
};

export default async function Page(props: { params: Promise<{ lang: string }> }) {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);
  return (
    <LinguiClientProvider initialLocale={lang} initialMessages={allMessages[lang]!}>
      <Header mode="landing" lang={supportedLang} />
      <PrivacyPolicy />
    </LinguiClientProvider>
  );
}
