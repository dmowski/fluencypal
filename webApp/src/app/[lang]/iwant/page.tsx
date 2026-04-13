import { IWantPage } from '@/features/Experiments/IWantPage';
import { supportedLanguages } from '@/features/Lang/lang';
import { generateMetadataInfo } from '@/features/SEO/metadata';
import { Metadata } from 'next';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return generateMetadataInfo({
    lang: (await props.params).lang,
    currentPath: 'iwant',
  });
}

export default async function IWantRoutePage(props: PageProps) {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || 'en';

  return <IWantPage lang={supportedLang} />;
}
