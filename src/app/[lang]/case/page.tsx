import type { Metadata } from "next";
import { InterviewListPage } from "@/features/Interview/ListPage/InterviewListPage";
import {
  generateListMetadata,
  ListInterviewPageProps,
} from "@/features/Interview/ListPage/metadata";

export async function generateMetadata(props: ListInterviewPageProps): Promise<Metadata> {
  return generateListMetadata(props);
}

export default async function Page(props: ListInterviewPageProps) {
  return <InterviewListPage {...props} />;
}
