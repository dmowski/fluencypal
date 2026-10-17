import { Footer } from '@/features/Landing/Footer';
import { HeaderStatic } from '@/features/Header/HeaderStatic';
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

export default async function Page() {
  const clubs = await fetchPublicSpeakingClubs();
  return (
    <html lang="en">
      <body>
        <HeaderStatic lang="en" />
        <SpeakingClubList lang="en" clubs={clubs} />
        <Footer lang="en" />
      </body>
    </html>
  );
}
