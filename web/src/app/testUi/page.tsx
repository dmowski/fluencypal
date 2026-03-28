import { TestPage } from './testComponents/TestPage';
import { Suspense } from 'react';
import { PracticeProvider } from '../practiceProvider';
import { AuthWall } from '@/features/Auth/AuthWall';

export default function UploadTestPage() {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <PracticeProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <AuthWall>
              <TestPage />
            </AuthWall>
          </Suspense>
        </PracticeProvider>
      </body>
    </html>
  );
}
