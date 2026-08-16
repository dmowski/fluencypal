import { PracticeProvider } from '../practiceProvider';
import { AdvancedPage } from '@/features/Advanced/AdvancedPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Advanced AI',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdvancedRoutePage() {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <PracticeProvider>
          <main>
            <AdvancedPage lang="en" />
          </main>
        </PracticeProvider>
      </body>
    </html>
  );
}
