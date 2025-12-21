import { generateMetadataInfo } from "@/features/SEO/metadata";
import type { Metadata } from "next";

export interface ListInterviewPageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    category?: string;
  }>;
}

export async function generateListMetadata(props: ListInterviewPageProps): Promise<Metadata> {
  const searchParam = await props.searchParams;
  const category = searchParam.category || "";

  return generateMetadataInfo({
    lang: (await props.params).lang,
    currentPath: "case",
    category,
  });
}
