import { Footer } from '@/features/Landing/Footer';
import { HeaderStatic } from '@/features/Header/HeaderStatic';
import { SpeakingClubMissing } from '@/features/SpeakingClub/SpeakingClubPages';
import { fetchPublicSpeakingClubs } from '@/features/SpeakingClub/publicClubs';

export default async function NotFound() {
  const clubs = await fetchPublicSpeakingClubs();
  return (
    <html lang="en">
      <body>
        <HeaderStatic lang="en" />
        <SpeakingClubMissing lang="en" clubs={clubs} />
        <Footer lang="en" />
      </body>
    </html>
  );
}
