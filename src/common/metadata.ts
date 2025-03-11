import { Robots } from "next/dist/lib/metadata/types/metadata-types";
import { OpenGraph } from "next/dist/lib/metadata/types/opengraph-types";
import { Twitter } from "next/dist/lib/metadata/types/twitter-types";

export const siteUrl = "https://fluencypal.com/";

export const openGraph: OpenGraph = {
  title: "FluencyPal – AI English Speaking Practice",
  description:
    "Practice conversational English anytime with FluencyPal, your personal AI English tutor. Improve fluency, pronunciation, and confidence through realistic, immersive conversations.",
  url: siteUrl,
  images: [
    {
      url: `${siteUrl}openGraph.png`,
      width: 1200,
      height: 630,
      alt: "FluencyPal - AI English Speaking Practice App",
    },
  ],
  locale: "en_US",
  type: "website",
};

export const twitter: Twitter = {
  card: "summary_large_image",
  title: "FluencyPal – Your AI English Speaking Partner",
  description:
    "FluencyPal helps intermediate and advanced learners improve English speaking fluency through personalized AI-driven conversations. Available 24/7, no subscriptions required.",
  images: [`${siteUrl}openGraph.png`],
  creator: "@dmowskii",
};

export const robots: Robots = {
  index: true,
  follow: true,
};
