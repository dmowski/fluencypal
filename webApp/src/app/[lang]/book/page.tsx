import { Suspense } from 'react';
import { ReaderTest } from '@/features/Reader/ReaderTest';
import { PracticeProvider } from '@/app/practiceProvider';

interface PageProps {
  params: Promise<{ lang: string }>;
}

export default async function UploadTestPage(props: PageProps) {
  return (
    <PracticeProvider>
      <Suspense fallback={<div>Loading...</div>}>
        <ReaderTest />
      </Suspense>
    </PracticeProvider>
  );
}
