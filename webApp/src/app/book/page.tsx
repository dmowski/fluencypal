import { Suspense } from 'react';
import { PracticeProvider } from '../practiceProvider';
import { ReaderTest } from '@/features/Reader/ReaderTest';
import { supportedLanguages } from '@/features/Lang/lang';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function UploadTestPage(props: PageProps) {
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
            <ReaderTest />
          </Suspense>
        </PracticeProvider>
      </body>
    </html>
  );
}
