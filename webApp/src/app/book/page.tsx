import { Suspense } from 'react';
import { ReaderPage } from '@/features/Reader/ReaderPage';
import { Metadata } from 'next';
import { generateMetadataInfo } from '@/features/SEO/metadata';
import { ThemeProvider } from '@mui/material';
import { lightTheme } from '@/features/uiKit/theme';

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
        <ThemeProvider theme={lightTheme}>
          <Suspense fallback={<div>Loading...</div>}>
            <ReaderPage />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
