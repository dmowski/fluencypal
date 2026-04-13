import type { Metadata } from 'next';
import {
  generateInterviewQuizMetadata,
  InterviewQuizPageProps,
} from '@/features/Case/quiz/metadata';

import { PageMoved } from '@/features/Landing/PageMoved';
import { supportedLanguages } from '@/features/Lang/lang';

export const dynamicParams = true;
export const revalidate = 3600; // Revalidate every hour

export async function generateMetadata(props: InterviewQuizPageProps): Promise<Metadata> {
  return generateInterviewQuizMetadata(props);
}

export default async function OneInterviewPage(props: InterviewQuizPageProps) {
  const params = await props.params;
  const supportedLang = supportedLanguages.find((l) => l === params.lang) || 'en';
  return <PageMoved lang={supportedLang} page={`case/${params.id}/quiz`} />;
}
