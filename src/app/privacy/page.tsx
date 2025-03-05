import { openGraph, robots, siteUrl, twitter } from "@/common/metadata";
import { Header } from "@/features/Header/Header";
import { PrivacyPolicy } from "@/features/Legal/PrivacyPolicy";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Dark Lang",
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
  openGraph: { ...openGraph, url: `${siteUrl}privacy` },
  twitter: twitter,
  robots: robots,
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <PrivacyPolicy />
    </>
  );
}
