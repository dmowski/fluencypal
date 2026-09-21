import { supportedLanguages } from '@/features/Lang/lang';
import { PracticeProvider } from '@/app/practiceProvider';
import { TranslationPage } from '@/features/TranslationPage/TranslationPage';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Translate',
  robots: {
    index: false,
    follow: false,
  },
};

export async function generateStaticParams() {
  return supportedLanguages.map((lang: string) => ({ lang }));
}

export default async function TranslateLangRoutePage(props: { params: Promise<{ lang: string }> }) {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((l) => l === lang) || 'en';

  return (
    <PracticeProvider>
      <main>
        <TranslationPage lang={supportedLang} />
      </main>
    </PracticeProvider>
  );
}
