import { Footer } from '@/features/Landing/Footer';
import { HeaderStatic } from '@/features/Header/HeaderStatic';
import { supportedLanguages } from '@/features/Lang/lang';
import { SpeakingClubDetail } from '@/features/SpeakingClub/SpeakingClubPages';
import { fetchPublicSpeakingClub } from '@/features/SpeakingClub/publicClubs';
import { fullEnglishLanguageName } from '@/features/Lang/lang';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const club = await fetchPublicSpeakingClub((await props.params).slug);
  if (!club) return { title: 'Speaking clubs', robots: { index: false, follow: true } };
  const language = fullEnglishLanguageName[club.languageCode] || 'English';
  const summary = club.subtitle.replace(/\s+/g, ' ').trim();
  return {
    title: `${club.title} — ${language} speaking club | FluencyPal`,
    description: `${summary} Practice ${language} out loud with ${club.memberCount} ${club.memberCount === 1 ? 'person' : 'people'}.`.slice(
      0,
      160,
    ),
  };
}

export default async function Page(props: { params: Promise<{ lang: string; slug: string }> }) {
  const params = await props.params;
  const lang = supportedLanguages.find((item) => item === params.lang) || 'en';
  const club = await fetchPublicSpeakingClub(params.slug);
  if (!club) notFound();
  return (
    <>
      <HeaderStatic lang={lang} />
      <SpeakingClubDetail lang={lang} club={club} />
      <Footer lang={lang} />
    </>
  );
}
