import { Suspense } from 'react';
import { ReaderPage } from '@/features/Reader/ReaderPage';
import { generateMetadataInfo } from '@/features/SEO/metadata';
import { Metadata } from 'next';

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
    <Suspense fallback={<div>Loading...</div>}>
      <ReaderPage />
    </Suspense>
  );
}
