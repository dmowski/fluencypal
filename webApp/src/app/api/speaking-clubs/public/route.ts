import { NextResponse } from 'next/server';
import { speakingClubErrorResponse } from '@/features/Chat/VoiceChat/backend/http';
import { listPublicClubs } from '@/features/Chat/VoiceChat/backend/rooms';

export async function GET() {
  try {
    const clubs = await listPublicClubs();
    return NextResponse.json({ clubs });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
