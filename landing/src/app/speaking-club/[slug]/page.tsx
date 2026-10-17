import { Footer } from '@/features/Landing/Footer';
import { HeaderStatic } from '@/features/Header/HeaderStatic';
import { SpeakingClubDetail } from '@/features/SpeakingClub/SpeakingClubPages';
import { fetchPublicSpeakingClub } from '@/features/SpeakingClub/publicClubs';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const club = await fetchPublicSpeakingClub((await props.params).slug);
  if (!club) return { title: 'Speaking clubs', robots: { index: false, follow: true } };
  return {
    title: `${club.title} speaking club`,
    description: club.subtitle || club.discussMarkdown.slice(0, 160),
  };
}

export default async function Page(props: { params: Promise<{ slug: string }> }) {
  const club = await fetchPublicSpeakingClub((await props.params).slug);
  if (!club) notFound();
  return (
    <html lang="en">
      <body>
        <HeaderStatic lang="en" />
        <SpeakingClubDetail lang="en" club={club} />
        <Footer lang="en" />
      </body>
    </html>
  );
}
