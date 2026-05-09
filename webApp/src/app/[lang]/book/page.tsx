import { Suspense } from 'react';
import { ReaderPage } from '@/features/Reader/ReaderPage';
import { generateMetadataInfo } from '@/features/SEO/metadata';
import { Metadata } from 'next';
import { ThemeProvider } from '@mui/material';
import { lightTheme } from '@/features/uiKit/theme';

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
  return (
    <ThemeProvider theme={lightTheme}>
      <Suspense fallback={<div>Loading...</div>}>
        <ReaderPage />
      </Suspense>
    </ThemeProvider>
  );
}
