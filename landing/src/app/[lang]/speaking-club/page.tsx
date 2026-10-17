import { Footer } from '@/features/Landing/Footer';
import { HeaderStatic } from '@/features/Header/HeaderStatic';
import { supportedLanguages } from '@/features/Lang/lang';
import { SpeakingClubList } from '@/features/SpeakingClub/SpeakingClubPages';
import { fetchPublicSpeakingClubs } from '@/features/SpeakingClub/publicClubs';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Speaking clubs for language practice | FluencyPal',
    description:
      'Find a speaking club, see what people talk about this week, and join with a short voice introduction.',
  };
}

export default async function Page(props: { params: Promise<{ lang: string }> }) {
  const params = await props.params;
  const lang = supportedLanguages.find((item) => item === params.lang) || 'en';
  const clubs = await fetchPublicSpeakingClubs();
  return (
    <>
      <HeaderStatic lang={lang} />
      <SpeakingClubList lang={lang} clubs={clubs} />
      <Footer lang={lang} />
    </>
  );
}
