import { Footer } from '@/features/Landing/Footer';
import { HeaderStatic } from '@/features/Header/HeaderStatic';
import { SpeakingClubList } from '@/features/SpeakingClub/SpeakingClubPages';
import { fetchPublicSpeakingClubs } from '@/features/SpeakingClub/publicClubs';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Speaking clubs',
    description: 'Practice English out loud with a small group.',
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
