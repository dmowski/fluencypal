import type { Metadata } from "next";

export type Ideas = "interview-speed" | "interview-frontend" | "interview-backend";

export const ideas: Ideas[] = ["interview-speed", "interview-frontend", "interview-backend"];

export interface IdeaPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams(idea: Ideas) {
  return [];
}

export async function generateMetadata(idea: Ideas, props: IdeaPageProps): Promise<Metadata> {}

export default async function Page(idea: Ideas, props: IdeaPageProps) {
  return <></>;
}
