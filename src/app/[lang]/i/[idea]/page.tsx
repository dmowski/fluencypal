import type { Metadata } from "next";
import {
  generateIdeaMetadata,
  generateIdeaStaticParams,
  IdeaLandingPage,
  IdeaPageProps,
} from "@/features/Ideas/IdeasLandings";

export async function generateStaticParams() {
  return generateIdeaStaticParams();
}

export async function generateMetadata(props: IdeaPageProps): Promise<Metadata> {
  return generateIdeaMetadata(props);
}

export default async function IdeaPage(props: IdeaPageProps) {
  const params = await props.params;
  return <IdeaLandingPage idea={params.idea} langParam={params.lang} />;
}
