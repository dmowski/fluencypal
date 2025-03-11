import type { Metadata } from "next";
import { PricePage } from "@/features/Landing/Price/PricePage";
import { openGraph, robots, siteUrl, twitter } from "@/common/metadata";
import { WELCOME_BONUS } from "@/common/usage";
import { APP_NAME } from "@/features/Landing/landingSettings";

export const metadata: Metadata = {
  title: `Affordable AI Language Learning | ${APP_NAME}`,
  description: `Get flexible pricing with ${APP_NAME}. Start with $${WELCOME_BONUS} free credits, pay-as-you-go, and enjoy AI-powered language practice with no subscriptions or hidden fees.`,
  keywords: [
    "AI language tutor pricing",
    "pay-as-you-go language learning",
    "online English pricing",
    "AI tutor cost",
  ],
  openGraph: { ...openGraph, url: `${siteUrl}pricing` },
  twitter: twitter,
  robots: robots,
};

export default async function ScenariosFullPage() {
  return <PricePage />;
}
