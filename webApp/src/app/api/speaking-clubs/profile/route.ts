import { NextResponse } from 'next/server';
import { requireSpeakingUser, saveSpeakingBio } from '@/features/Chat/VoiceChat/backend/access';
import {
  asRecord,
  readJson,
  readOptionalText,
  speakingClubErrorResponse,
} from '@/features/Chat/VoiceChat/backend/http';

export async function PATCH(request: Request) {
  try {
    const user = await requireSpeakingUser(request);
    const body = asRecord(await readJson(request));
    const bio = await saveSpeakingBio(user.uid, readOptionalText(body.bio, 500));
    return NextResponse.json({ bio });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
