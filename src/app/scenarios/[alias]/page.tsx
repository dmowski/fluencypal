import type { Metadata } from "next";
import LandingPage from "@/features/Landing/LandingPage";

const siteUrl = "https://dark-lang.net/";

interface PageProps {
  params: Promise<{ alias: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const alias = (await props.params).alias;

  console.log("alias", alias);

  const metadata: Metadata = {
    title: "Online English with AI Teacher",
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
    openGraph: {
      title: "Online English with AI Teacher | Dark Lang",
      description:
        "Learn English (or other languages) with Bruno, your friendly AI tutor. Beginner, instant corrections, and advanced modes help you improve fast—no scheduling required.",
      url: siteUrl,
      siteName: "Dark Lang",
      images: [
        {
          url: `${siteUrl}/openGraph.png`,
          width: 1200,
          height: 630,
          alt: "Dark Lang - Online English with AI Teacher",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Online English with AI Teacher | Dark Lang",
      description:
        "Practice speaking English, French, or another language with a personalized AI tutor named Bruno.",
      images: [`${siteUrl}/openGraph.png`],
      creator: "@dmowskii",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
  return metadata;
}

export default function Home() {
  return <LandingPage />;
}
