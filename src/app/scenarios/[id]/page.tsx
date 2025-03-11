import type { Metadata } from "next";
import rolePlayScenarios from "@/features/RolePlay/rolePlayData";
import { ScenarioOnePage } from "@/features/Landing/RolePlay/ScenarioOnePage";
import { openGraph, robots, siteUrl, twitter } from "@/common/metadata";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const id = (await props.params).id;

  const scenario = rolePlayScenarios.find((s) => s.id === id);
  if (!scenario) {
    return {};
  }

  const title = `${scenario.title} - Practice English Conversation with AI | FluencyPal`;
  const description = scenario.subTitle;

  const metadata: Metadata = {
    title,
    description,

    keywords: [
      "AI English Tutor",
      "English Role-Play",
      "Conversational English Practice",
      "English Fluency",
      "Advanced English Conversation",
      "Online Language Practice",
      "Language Immersion",
      "Real-Life English Scenarios",
      "English Speaking Exercises",
    ],
    openGraph: {
      ...openGraph,
      title,
      description,
      url: `${siteUrl}scenarios/${id}`,
      siteName: "FluencyPal",
      images: [
        {
          url: `${siteUrl}${scenario.imageSrc}`,
          width: 1200,
          height: 630,
          alt: `FluencyPal - ${scenario.title}`,
        },
      ],
    },
    twitter: {
      ...twitter,
      title: `Practice ${scenario.title} | FluencyPal`,
      description: scenario.subTitle,
      images: [`${siteUrl}${scenario.imageSrc}`],
    },
    robots: robots,
  };
  return metadata;
}

export default async function ScenarioOneFullPage(props: PageProps) {
  const params = await props.params;
  const id = params.id;
  return <ScenarioOnePage id={id} />;
}
