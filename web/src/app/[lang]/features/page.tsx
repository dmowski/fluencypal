import type { Metadata } from 'next';
import { supportedLanguages } from '@/features/Lang/lang';
import { generateMetadataInfo } from '@/features/SEO/metadata';
import { FeaturesPage } from '@/features/Feature/FeaturesPage';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return generateMetadataInfo({
    lang: (await props.params).lang,
    currentPath: 'features',
  });
}

export default async function FeaturesFullPage(props: PageProps) {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((item) => item === lang) || 'en';

  return <FeaturesPage lang={supportedLang} />;
}
