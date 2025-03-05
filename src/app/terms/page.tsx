import { openGraph, robots, siteUrl, twitter } from "@/common/metadata";
import { Header } from "@/features/Header/Header";
import { TermsOfUse } from "@/features/Legal/TermsOfUse";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use | Dark Lang",
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
  openGraph: { ...openGraph, url: siteUrl + "terms" },
  twitter: twitter,
  robots: robots,
};

export default function TermsOfUsePage() {
  return (
    <>
      <Header />
      <TermsOfUse />
    </>
  );
}
