import type { Metadata } from "next";
import {
  InterviewPageProps,
  generateInterviewStaticParams,
  generateInterviewMetadata,
  InterviewLandingPageNext,
} from "@/features/Case/Landing/InterviewLandingPageNext";

export async function generateStaticParams() {
  return generateInterviewStaticParams();
}

export async function generateMetadata(
  props: InterviewPageProps,
): Promise<Metadata> {
  return generateInterviewMetadata(props);
}

export default async function OneInterviewPage(props: InterviewPageProps) {
  const params = await props.params;
  return <InterviewLandingPageNext id={params.id} langParam={params.lang} />;
}
