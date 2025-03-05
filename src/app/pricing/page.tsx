import type { Metadata } from "next";
import { PricePage } from "@/features/Landing/PricePage";
const siteUrl = "https://dark-lang.net/";

export const metadata: Metadata = {
  title: "Affordable AI Language Learning | Dark Lang Pricing",
  description:
    "Get flexible pricing with Dark Lang. Start with $5 free credits, pay-as-you-go, and enjoy AI-powered language practice with no subscriptions or hidden fees.",
  keywords: [
    "AI language tutor pricing",
    "pay-as-you-go language learning",
    "online English pricing",
    "AI tutor cost",
  ],
  openGraph: {
    title: "Affordable AI Language Learning | Dark Lang Pricing",
    description:
      "Discover our pay-as-you-go pricing model for Dark Lang. Pay only for the language learning features you need, with no long-term commitments.",
    url: `${siteUrl}pricing`,
    siteName: "Dark Lang",
    images: [
      {
        url: `${siteUrl}/openGraph.png`,
        width: 1200,
        height: 630,
        alt: "Dark Lang – Affordable AI-Powered Language Learning",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flexible Pricing for AI-Powered Language Learning | Dark Lang",
    description:
      "Choose a pay-as-you-go model for AI-powered language learning. No subscriptions, no hidden fees—just affordable and flexible pricing.",
    images: [`${siteUrl}/openGraph.png`],
    creator: "@dmowskii",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function ScenariosFullPage() {
  return <PricePage />;
}
