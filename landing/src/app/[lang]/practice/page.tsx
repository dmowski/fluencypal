import { supportedLanguages } from '@/features/Lang/lang';
import { Metadata } from 'next';
import { generateMetadataInfo } from '@/features/SEO/metadata';
import { PageMoved } from '@/features/Landing/PageMoved';

export async function generateStaticParams() {
  return supportedLanguages.map((lang: string) => ({ lang }));
}

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    rolePlayId?: string;
  }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const rolePlayId = (await props.searchParams).rolePlayId;
  return generateMetadataInfo({
    lang: (await props.params).lang,
    currentPath: 'practice',
    rolePlayId,
  });
}

export default async function Page(props: { params: Promise<{ lang: string }> }) {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || 'en';

  return (
    <main>
      <PageMoved lang={supportedLang} page="practice" />
    </main>
  );
}
