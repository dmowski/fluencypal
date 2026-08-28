import { supportedLanguages } from '@/features/Lang/lang';
import { Metadata } from 'next';
import { generateMetadataInfo } from '@/features/SEO/metadata';
import { PracticeProvider } from '../../practiceProvider';
import { AuthWall } from '@/features/Auth/AuthWall';
import { CustomAnalyticsAdmin } from '@/features/Analytics/Custom/Admin/CustomAnalyticsAdmin';

export async function generateStaticParams() {
  return supportedLanguages.map((lang: string) => ({ lang }));
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  return {
    ...generateMetadataInfo({
      lang: (await props.params).lang,
      currentPath: 'practice',
    }),
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function Page(props: { params: Promise<{ lang: string }> }) {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || 'en';

  return (
    <html lang={supportedLang}>
      <body>
        <PracticeProvider>
          <main>
            <AuthWall>
              <CustomAnalyticsAdmin />
            </AuthWall>
          </main>
        </PracticeProvider>
      </body>
    </html>
  );
}
