import { Robots } from "next/dist/lib/metadata/types/metadata-types";
import { OpenGraph } from "next/dist/lib/metadata/types/opengraph-types";
import { Twitter } from "next/dist/lib/metadata/types/twitter-types";

export const siteUrl = "https://dark-lang.net/";

export const openGraph: OpenGraph = {
  title: "Online English with AI Teacher | Dark Lang",
  description:
    "Learn English (or other languages) with Bruno, your friendly AI tutor. Beginner, instant corrections, and advanced modes help you improve fast—no scheduling required.",
  url: siteUrl,
  siteName: "Dark Lang",
  images: [
    {
      url: `${siteUrl}openGraph.png`,
      width: 1200,
      height: 630,
      alt: "Dark Lang - Online English with AI Teacher",
    },
  ],
  locale: "en_US",
  type: "website",
};

export const twitter: Twitter = {
  card: "summary_large_image",
  title: "Online English with AI Teacher | Dark Lang",
  description:
    "Practice speaking English, French, or another language with a personalized AI tutor named Bruno.",
  images: [`${siteUrl}openGraph.png`],
  creator: "@dmowskii",
};

export const robots: Robots = {
  index: true,
  follow: true,
};
