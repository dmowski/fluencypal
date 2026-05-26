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
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="e54b6925-d2d8-4569-9594-101c6af33562"
        />
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
