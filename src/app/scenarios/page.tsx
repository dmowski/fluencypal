import type { Metadata } from "next";
import ScenariosPage from "@/features/Landing/RolePlay/ScenariosPage";

const siteUrl = "https://dark-lang.net/";

export const metadata: Metadata = {
  title: "Role-Play Scenarios for Real-Life Conversations | Dark Lang",
  description:
    "Explore immersive role-play scenarios to practice real-life conversations in English, French, and more. Build confidence with an AI tutor who adapts to your level and corrects mistakes in real time.",
  keywords: [
    "Role-Play Scenarios",
    "Real-Life Conversations",
    "English Practice",
    "AI Language Tutor",
    "Dark Lang",
    "Language Learning",
    "Beginner",
    "Advanced",
  ],
  openGraph: {
    title: "Role-Play Scenarios for Real-Life Conversations | Dark Lang",
    description:
      "Practice ordering food, scheduling appointments, job interviews, and more with our AI-powered role-play scenarios. Improve your language skills in English, French, or any language we support.",
    url: `${siteUrl}scenarios`,
    siteName: "Dark Lang",
    images: [
      {
        url: `${siteUrl}/openGraph.png`,
        width: 1200,
        height: 630,
        alt: "Dark Lang – Role-Play Scenarios for Real-Life Conversations",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Role-Play Scenarios for Real-Life Conversations | Dark Lang",
    description:
      "Enhance your speaking skills with AI-powered role-play scenarios for everyday situations—restaurants, doctor visits, job interviews, and more.",
    images: [`${siteUrl}/openGraph.png`],
    creator: "@dmowskii",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function Home() {
  return <ScenariosPage />;
}
