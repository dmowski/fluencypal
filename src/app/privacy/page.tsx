import { openGraph, robots, siteUrl, twitter } from "@/common/metadata";
import { Header } from "@/features/Header/Header";
import { APP_NAME } from "@/features/Landing/landingSettings";
import { PrivacyPolicy } from "@/features/Legal/PrivacyPolicy";
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

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header mode="landing" />
      <PrivacyPolicy />
    </>
  );
}
