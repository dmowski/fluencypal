import type { Metadata } from "next";
import {
  OneInterviewLandingPage,
  InterviewPageProps,
  generateInterviewStaticParams,
  generateInterviewMetadata,
} from "@/features/Interview/OneInterviewLandingPage";

export async function generateStaticParams() {
  return generateInterviewStaticParams();
}

export async function generateMetadata(props: InterviewPageProps): Promise<Metadata> {
  return generateInterviewMetadata(props);
}

export default async function OneInterviewPage(props: InterviewPageProps) {
  const params = await props.params;
  return <OneInterviewLandingPage id={params.id} langParam={params.lang} />;
}
