'use client';

import { AuthProvider } from '@/features/Auth/useAuth';
import { TestPage } from './testComponents/TestPage';

export default function UploadTestPage() {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <AuthProvider>
          <TestPage />
        </AuthProvider>
      </body>
    </html>
  );
}
