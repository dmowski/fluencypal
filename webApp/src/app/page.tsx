import { supportedLanguages } from '@/features/Lang/lang';
import { PracticePage } from '@/features/Router/PracticePage';
import { getRolePlayScenarios } from '@/features/RolePlay/rolePlayData';
import { Metadata, Viewport } from 'next';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { ThemeProvider } from '@mui/material';
import { generateMetadataInfo } from '@/features/SEO/metadata';
import { PracticeProvider } from './practiceProvider';
import { TopOffset } from '@/features/Layout/TopOffset';
import { ReaderPage } from '@/features/Reader/ReaderPage';
import { lightTheme } from '@/features/uiKit/theme';
import { ServiceWorkerRegister } from '@/features/Pwa/ServiceWorkerRegister';

export async function generateStaticParams() {
  return supportedLanguages.map((lang: string) => ({ lang }));
}

interface PageProps {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{
    rolePlayId?: string;
  }>;
}

import { isBookHost } from '@/features/SEO/hosts';

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const host = (await headers()).get('host');
  if (isBookHost(host)) {
    return {
      ...generateMetadataInfo({
        lang: 'en',
        currentPath: 'book',
      }),
      appleWebApp: {
        capable: true,
        title: 'Reader',
        statusBarStyle: 'default',
      },
    };
  }
  const rolePlayId = (await props.searchParams).rolePlayId;
  return {
    ...generateMetadataInfo({
      lang: (await props.params).lang,
      currentPath: 'practice',
      rolePlayId,
    }),
    appleWebApp: {
      capable: true,
      title: 'FluencyPal',
      statusBarStyle: 'black-translucent',
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const host = (await headers()).get('host');
  return {
    themeColor: isBookHost(host) ? '#F4E1C6' : '#0a121e',
  };
}

export default async function Page(props: { params: Promise<{ lang: string }> }) {
  const host = (await headers()).get('host');

  if (isBookHost(host)) {
    return (
      <html lang="en">
        <head>
          <meta name="robots" content="noindex, nofollow" />
        </head>
        <body>
          <ThemeProvider theme={lightTheme}>
            <Suspense fallback={<div>Loading...</div>}>
              <ReaderPage />
            </Suspense>
          </ThemeProvider>
          <ServiceWorkerRegister />
        </body>
      </html>
    );
  }

  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || 'en';
  const rolePlayInfo = getRolePlayScenarios(supportedLang);

  return (
    <html lang={supportedLang}>
      <body>
        <PracticeProvider>
          <TopOffset />
          <main>
            <PracticePage rolePlayInfo={rolePlayInfo} lang={supportedLang} />
          </main>
        </PracticeProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
