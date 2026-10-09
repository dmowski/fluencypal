import type { Metadata } from 'next';
import { getI18nInstance } from '@/appRouterI18n';
import { PracticeProvider } from '@/app/practiceProvider';
import { supportedLanguages, SupportedLanguage } from '@/features/Lang/lang';
import { TalkWithAlexPage } from '@/features/TalkWithAlex/TalkWithAlexPage';

export async function generateStaticParams() {
  return supportedLanguages.map((lang: string) => ({ lang }));
}

interface PageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const lang = supportedLanguages.find((item) => item === params.lang) || 'en';
  const i18n = getI18nInstance(lang);
  return {
    title: i18n._('Talk with Alex | FluencyPal'),
    description: i18n._(
      'Leave a way for Alex to reach you. He writes back and you pick a time for a short call.',
    ),
  };
}

export default async function Page(props: PageProps) {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((item) => item === lang) || 'en';

  return (
    <PracticeProvider>
      <TalkWithAlexPage lang={supportedLang as SupportedLanguage} />
    </PracticeProvider>
  );
}
