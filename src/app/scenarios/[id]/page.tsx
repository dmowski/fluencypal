import type { Metadata } from "next";
import LandingPage from "@/features/Landing/LandingPage";
import rolePlayScenarios from "@/features/RolePlay/rolePlayData";
import { ScenarioOnePage } from "@/features/Landing/RolePlay/ScenarioOnePage";

const siteUrl = "https://dark-lang.net/";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const id = (await props.params).id;

  const scenario = rolePlayScenarios.find((s) => s.id === id);
  if (!scenario) {
    return {};
  }

  const metadata: Metadata = {
    title: scenario.title + " | Dark Lang",
    description: scenario.subTitle,

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

export default async function ScenarioOneFullPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;
  return <ScenarioOnePage id={id} />;
}
