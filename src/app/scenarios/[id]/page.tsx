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

  const title = scenario.title + " | Dark Lang";
  const subTitle = scenario.subTitle;

  const metadata: Metadata = {
    title: title,
    description: subTitle,

    keywords: [
      "Online English",
      "Learn English",
      "AI Language Tutor",
      "English Practice",
      "Dark Lang",
      "Language Learning",
    ],
    openGraph: {
      ...openGraph,
      title: title,
      description: subTitle,
      url: `${siteUrl}scenarios/${id}`,
      siteName: "Dark Lang",
    },
    twitter: {
      ...twitter,
      title: `${scenario.title} | Dark Lang`,
      description: scenario.subTitle,
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
