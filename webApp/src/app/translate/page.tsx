import { PracticeProvider } from '../practiceProvider';
import { TranslationPage } from '@/features/TranslationPage/TranslationPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Translate',
  robots: {
    index: false,
    follow: false,
  },
};

export default function TranslateRoutePage() {
  return (
    <html lang="en">
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <PracticeProvider>
          <main>
            <TranslationPage lang="en" />
          </main>
        </PracticeProvider>
      </body>
    </html>
  );
}
