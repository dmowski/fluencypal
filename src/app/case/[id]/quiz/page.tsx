import type { Metadata } from "next";
import {
  generateInterviewQuizMetadata,
  generateInterviewQuizStaticParams,
  InterviewQuizPageProps,
} from "@/features/Interview/quiz/metadata";
import { InterviewQuizPageNext } from "@/features/Interview/quiz/InterviewQuizPageNext";

export async function generateStaticParams() {
  return generateInterviewQuizStaticParams();
}

export async function generateMetadata(props: InterviewQuizPageProps): Promise<Metadata> {
  return generateInterviewQuizMetadata(props);
}

export default async function OneInterviewPage(props: InterviewQuizPageProps) {
  const params = await props.params;
  return <InterviewQuizPageNext id={params.id} langParam={params.lang} />;
}
