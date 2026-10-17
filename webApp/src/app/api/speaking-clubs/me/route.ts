import { NextResponse } from 'next/server';
import { requireSpeakingUser } from '@/features/Chat/VoiceChat/backend/access';
import { deleteSpeakingData, exportSpeakingData } from '@/features/Chat/VoiceChat/backend/erasure';
import { speakingClubErrorResponse } from '@/features/Chat/VoiceChat/backend/http';

export async function GET(request: Request) {
  try {
    const user = await requireSpeakingUser(request);
    const data = await exportSpeakingData(user.uid);
    return new NextResponse(JSON.stringify(data, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="fluencypal-voice.json"',
      },
    });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await requireSpeakingUser(request);
    await deleteSpeakingData(user.uid);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
