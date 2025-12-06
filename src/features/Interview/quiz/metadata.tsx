import { SupportedLanguage, supportedLanguages } from "@/features/Lang/lang";
import { getAllInterviews } from "../data";
import type { Metadata } from "next";
import { generateMetadataInfo } from "@/features/SEO/metadata";

export interface InterviewQuizPageProps {
  params: Promise<{
    id: string;
    lang: string;
  }>;
}

export async function generateInterviewQuizStaticParams() {
  const { interviews } = getAllInterviews("en");
  return supportedLanguages
    .map((lang: string) => {
      return interviews.map((item) => {
        return { id: item.id, lang };
      });
    })
    .flat();
}

export async function generateInterviewQuizMetadata(
  props: InterviewQuizPageProps
): Promise<Metadata> {
  const params = await props.params;
  const id = params.id;
  const lang = (params.lang || "en") as SupportedLanguage;
  const supportedLang = supportedLanguages.find((l) => l === lang) || "en";

  return generateMetadataInfo({
    lang: supportedLang,
    interviewId: id,
    currentPath: "quizInterview",
  });
}
