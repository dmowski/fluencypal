import type { Metadata } from "next";
import { ScenariosPage } from "@/features/Landing/RolePlay/ScenariosPage";
import { openGraph, robots, siteUrl, twitter } from "@/common/metadata";

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
    ...openGraph,
    title: "Role-Play Scenarios for Real-Life Conversations | Dark Lang",
    description:
      "Practice ordering food, scheduling appointments, job interviews, and more with our AI-powered role-play scenarios. Improve your language skills in English, French, or any language we support.",
    url: `${siteUrl}scenarios`,
    images: [
      {
        url: `${siteUrl}openGraph.png`,
        width: 1200,
        height: 630,
        alt: "Dark Lang – Role-Play Scenarios for Real-Life Conversations",
      },
    ],
  },
  twitter: {
    ...twitter,
    title: "Role-Play Scenarios for Real-Life Conversations | Dark Lang",
    description:
      "Enhance your speaking skills with AI-powered role-play scenarios for everyday situations—restaurants, doctor visits, job interviews, and more.",
  },
  robots: robots,
};
interface ScenariosPageProps {
  searchParams: Promise<{
    category?: string;
  }>;
}
export default async function ScenariosFullPage(props: ScenariosPageProps) {
  const params = await props.searchParams;
  const category = params.category;
  return <ScenariosPage selectedCategory={category} />;
}
