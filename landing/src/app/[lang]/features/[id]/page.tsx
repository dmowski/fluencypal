import type { Metadata } from 'next';
import { supportedLanguages } from '@/features/Lang/lang';
import { generateMetadataInfo } from '@/features/SEO/metadata';
import { FeatureOnePage } from '@/features/Feature/FeatureOnePage';

interface FeatureProps {
  id: string;
  lang: string;
}

interface PageProps {
  params: Promise<FeatureProps>;
}

export const dynamicParams = true;
export const revalidate = 3600;

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return generateMetadataInfo({
    lang: (await props.params).lang,
    currentPath: 'features',
    featureId: (await props.params).id,
  });
}

export default async function FeatureOneFullPage(props: PageProps) {
  const params = await props.params;
  const supportedLang = supportedLanguages.find((item) => item === params.lang) || 'en';

  return <FeatureOnePage id={params.id} lang={supportedLang} />;
}
