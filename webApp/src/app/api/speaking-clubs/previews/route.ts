import { NextResponse } from 'next/server';
import { requireSpeakingUser } from '@/features/Chat/VoiceChat/backend/access';
import {
  asRecord,
  readJson,
  readText,
  speakingClubErrorResponse,
} from '@/features/Chat/VoiceChat/backend/http';
import { generateRoomPreviewUrls } from '@/features/Chat/VoiceChat/backend/previews';

export async function POST(request: Request) {
  try {
    await requireSpeakingUser(request);
    const body = asRecord(await readJson(request));
    const title = readText(body.title, 80, 'Room name');
    const subtitle = readText(body.subtitle, 160, 'Short description');
    const count = typeof body.count === 'number' ? body.count : 3;
    const urls = await generateRoomPreviewUrls({ title, subtitle, count });
    return NextResponse.json({ urls });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
