import { NextResponse } from 'next/server';
import { requireSpeakingUser } from '@/features/Chat/VoiceChat/backend/access';
import {
  asRecord,
  readJson,
  readOptionalText,
  speakingClubErrorResponse,
} from '@/features/Chat/VoiceChat/backend/http';
import { reportSpeakingContent } from '@/features/Chat/VoiceChat/backend/reports';

export async function POST(request: Request) {
  try {
    const user = await requireSpeakingUser(request);
    const body = asRecord(await readJson(request));
    await reportSpeakingContent({
      reporterId: user.uid,
      roomId: readOptionalText(body.roomId, 80),
      messageId: readOptionalText(body.messageId, 128),
      targetUserId: readOptionalText(body.targetUserId, 128),
      note: readOptionalText(body.note, 500),
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
