import type { Metadata } from 'next';
import { supportedLanguages } from '@/features/Lang/lang';
import { generateMetadataInfo } from '@/features/SEO/metadata';
import { PageMoved } from '@/features/Landing/PageMoved';

export async function generateStaticParams() {
  return supportedLanguages.map((lang: string) => ({ lang }));
}

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    learn?: string;
  }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const searchParam = await props.searchParams;
  const toLearn = searchParam.learn || '';
  const languageToLearn = supportedLanguages.find((l) => l === toLearn) || 'en';
  return generateMetadataInfo({
    lang: (await props.params).lang,
    currentPath: 'quiz',
    languageToLearn,
  });
}

export default async function Page(props: PageProps) {
  const lang = (await props.params).lang;

  const supportedLang = supportedLanguages.find((l) => l === lang) || 'en';

  return <PageMoved lang={supportedLang} page="quiz" />;
}
