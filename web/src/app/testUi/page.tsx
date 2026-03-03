'use client';

import { AuthProvider } from '@/features/Auth/useAuth';
import { TestPage } from './testComponents/TestPage';
import { Suspense } from 'react';

export default function UploadTestPage() {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <AuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            <TestPage />
          </Suspense>
        </AuthProvider>
      </body>
    </html>
  );
}
