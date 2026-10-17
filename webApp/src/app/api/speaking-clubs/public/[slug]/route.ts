import { NextResponse } from 'next/server';
import { speakingClubErrorResponse } from '@/features/Chat/VoiceChat/backend/http';
import { getPublicClub } from '@/features/Chat/VoiceChat/backend/rooms';

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await context.params;
    const club = await getPublicClub(slug);
    if (!club) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ club });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
