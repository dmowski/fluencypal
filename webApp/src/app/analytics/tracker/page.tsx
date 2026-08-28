import { supportedLanguages } from '@/features/Lang/lang';
import { Metadata } from 'next';
import { generateMetadataInfo } from '@/features/SEO/metadata';
import { TrackerPage } from '@/features/Analytics/Custom/TrackerPage';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...generateMetadataInfo({
      lang: 'en',
      currentPath: 'practice',
    }),
    title: 'Analytics tracker',
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default function Page() {
  const supportedLang = supportedLanguages[0] || 'en';
  return (
    <html lang={supportedLang}>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <TrackerPage />
      </body>
    </html>
  );
}
