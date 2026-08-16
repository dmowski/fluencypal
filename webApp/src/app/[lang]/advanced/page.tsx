import { supportedLanguages } from '@/features/Lang/lang';
import { PracticeProvider } from '@/app/practiceProvider';
import { AdvancedPage } from '@/features/Advanced/AdvancedPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Advanced AI',
  robots: {
    index: false,
    follow: false,
  },
};

export async function generateStaticParams() {
  return supportedLanguages.map((lang: string) => ({ lang }));
}

export default async function AdvancedLangRoutePage(props: { params: Promise<{ lang: string }> }) {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || 'en';

  return (
    <PracticeProvider>
      <main>
        <AdvancedPage lang={supportedLang} />
      </main>
    </PracticeProvider>
  );
}
