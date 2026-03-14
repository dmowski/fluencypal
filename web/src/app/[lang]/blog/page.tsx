import type { Metadata } from 'next';
import { supportedLanguages } from '@/features/Lang/lang';
import { generateMetadataInfo } from '@/features/SEO/metadata';
import { BlogsPage } from '@/features/Blog/BlogsPage';

export const dynamicParams = true;
export const revalidate = 3600;

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    category?: string;
  }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const searchParam = await props.searchParams;
  const category = searchParam.category || '';

  return generateMetadataInfo({
    lang: (await props.params).lang,
    currentPath: 'blog',
    category,
  });
}

export default async function BlogFullPage(props: PageProps) {
  const params = await props.searchParams;
  const category = params.category;

  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || 'en';

  return <BlogsPage selectedCategory={category} lang={supportedLang} />;
}
