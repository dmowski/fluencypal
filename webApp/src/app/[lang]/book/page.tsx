import { Suspense } from 'react';
import { ReaderPage } from '@/features/Reader/ReaderPage';
import { PracticeProvider } from '@/app/practiceProvider';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function UploadTestPage(props: PageProps) {
  return (
    <PracticeProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <ReaderPage />
      </Suspense>
    </PracticeProvider>
  );
}
