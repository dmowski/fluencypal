import { Suspense } from 'react';
import { PracticeProvider } from '../practiceProvider';
import { ReaderPage } from '@/features/Reader/ReaderPage';
import { supportedLanguages } from '@/features/Lang/lang';
import { Metadata } from 'next';
import { generateMetadataInfo } from '@/features/SEO/metadata';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return generateMetadataInfo({
    lang: (await props.params).lang,
    currentPath: 'book',
  });
}

export default async function BookPage(props: PageProps) {
  const lang = (await props.params).lang;

  const supportedLang = supportedLanguages.find((l) => l === lang) || 'en';

  return (
    <html lang={supportedLang}>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <PracticeProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <ReaderPage />
          </Suspense>
        </PracticeProvider>
      </body>
    </html>
  );
}
