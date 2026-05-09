import { Suspense } from 'react';
import { ReaderPage } from '@/features/Reader/ReaderPage';
import { Metadata } from 'next';
import { generateMetadataInfo } from '@/features/SEO/metadata';

export async function generateMetadata(): Promise<Metadata> {
  return generateMetadataInfo({
    lang: 'en',
    currentPath: 'book',
  });
}

export default async function BookPage() {
  const supportedLang = 'en';

  return (
    <html lang={supportedLang}>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <ReaderPage />
        </Suspense>
      </body>
    </html>
  );
}
