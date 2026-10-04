import type { Metadata } from 'next';
import { getI18nInstance } from '@/appRouterI18n';
import { supportedLanguages, SupportedLanguage } from '@/features/Lang/lang';
import { PracticeProvider } from '@/app/practiceProvider';
import { CommunityCallOnboarding } from '@/features/FluencyCall/CommunityCallOnboarding';

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
    title: i18n._('Join a group conversation | FluencyPal'),
    description: i18n._(
      'See upcoming group calls, create an account, and practice with AI until the call.',
    ),
  };
}

export default async function Page(props: PageProps) {
  const lang = (await props.params).lang;
  const supportedLang = supportedLanguages.find((item) => item === lang) || 'en';

  return (
    <PracticeProvider>
      <CommunityCallOnboarding lang={supportedLang as SupportedLanguage} />
    </PracticeProvider>
  );
}
