import { supportedLanguages } from '@/features/Lang/lang';
import { Metadata } from 'next';
import { generateMetadataInfo } from '@/features/SEO/metadata';
import { PracticeProvider } from '../../practiceProvider';
import { AliasPage } from '@/features/Alias/AliasPage';

export async function generateStaticParams() {
  return supportedLanguages.map((lang: string) => ({ lang }));
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return {
    ...generateMetadataInfo({
      lang: (await props.params).lang,
      currentPath: 'alias',
    }),
  };
}

export default async function Page(props: { params: Promise<{ lang: string }> }) {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || 'en';

  return (
    <html lang={supportedLang}>
      <body>
        <main>
          <AliasPage />
        </main>
      </body>
    </html>
  );
}
