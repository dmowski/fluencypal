'use client';

import { Suspense } from 'react';
import { IWant } from './IWant';

export default function UploadTestPage() {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <IWant />
        </Suspense>
      </body>
    </html>
  );
}
