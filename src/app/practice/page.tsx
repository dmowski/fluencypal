import { openGraph, robots, siteUrl, twitter } from "@/common/metadata";
import { ConversationPage } from "@/features/Conversation/ConversationPage";
import { Header } from "@/features/Header/Header";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Practice | Dark Lang",
  description:
    "Experience next-level language practice with Bruno, your friendly AI tutor. Whether you're a beginner or advanced learner, Bruno adapts to your pace, corrects mistakes, and keeps you motivated.",

  keywords: [
    "Online English",
    "Learn English",
    "AI Language Tutor",
    "English Practice",
    "Dark Lang",
    "Language Learning",
  ],
  openGraph: { ...openGraph, url: siteUrl + "practice" },
  twitter: twitter,
  robots: robots,
};

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <ConversationPage />
      </main>
    </>
  );
}
