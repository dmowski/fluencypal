import type { Metadata } from "next";
import { ScenariosPage } from "@/features/Landing/RolePlay/ScenariosPage";
import { robots, siteUrl } from "@/common/metadata";
import { APP_NAME } from "@/features/Landing/landingSettings";
import { supportedLanguages } from "@/common/lang";
import { initLingui } from "@/initLingui";

export const metadata: Metadata = {
  title: `Real-Life English Role-Play Scenarios | ${APP_NAME}`,
  description: `Practice realistic English conversations with ${APP_NAME}’s AI tutor. From job interviews to casual chats, build fluency and confidence through immersive role-play scenarios designed for intermediate and advanced learners.`,
  keywords: [
    "English Role-Play",
    "English Speaking Practice",
    "AI English Tutor",
    "Advanced English Conversation",
    "Practice English Online",
    "Real-Life English Scenarios",
    "Language Immersion",
    "Fluency Improvement",
  ],
  openGraph: {
    title: `Practice Real-Life English Scenarios with AI | ${APP_NAME}`,
    description:
      "Boost your English fluency with interactive AI-powered role-play scenarios. Practice job interviews, daily conversations, travel dialogues, and more. Perfect for intermediate and advanced learners.",
    url: `${siteUrl}scenarios`,
    images: [
      {
        url: `${siteUrl}openGraph.png`,
        width: 1200,
        height: 630,
        alt: `${APP_NAME} – AI English Speaking Practice`,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Real-Life English Role-Play | ${APP_NAME}`,
    description: `Practice real-life English scenarios—job interviews, daily conversations, and more—with ${APP_NAME}’s personalized AI tutor. Perfect for intermediate and advanced learners.`,
    images: [`${siteUrl}openGraph.png`],
    creator: "@dmowskii",
  },
  robots: robots,
};

interface ScenariosPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
  params: Promise<{ lang: string }>;
}
export default async function ScenariosFullPage(props: ScenariosPageProps) {
  const params = await props.searchParams;
  const category = params.category;

  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";
  initLingui(supportedLang);

  return <ScenariosPage selectedCategory={category} lang={supportedLang} />;
}
