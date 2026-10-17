import { NextResponse } from 'next/server';
import { loadSpeakingProfile, requireSpeakingUser } from '@/features/Chat/VoiceChat/backend/access';
import { readAudioFile, readDuration } from '@/features/Chat/VoiceChat/backend/forms';
import {
  readOptionalText,
  speakingClubErrorResponse,
} from '@/features/Chat/VoiceChat/backend/http';
import { submitJoinRequest } from '@/features/Chat/VoiceChat/backend/members';
import { notifyReviewers } from '@/features/Chat/VoiceChat/backend/notifications';
import { getSpeakingRoom } from '@/features/Chat/VoiceChat/backend/rooms';
import { saveSpeakingAudio } from '@/features/Chat/VoiceChat/backend/storage';

export async function POST(request: Request, context: { params: Promise<{ roomId: string }> }) {
  try {
    const user = await requireSpeakingUser(request);
    const { roomId } = await context.params;
    const room = await getSpeakingRoom(roomId);
    if (!room) return NextResponse.json({ error: 'That room is not here.' }, { status: 404 });
    const audio = await readAudioFile(request);
    const saved = await saveSpeakingAudio({
      folder: `${roomId}/intros`,
      id: user.uid,
      buffer: audio.buffer,
      contentType: audio.contentType,
    });
    const profile = await loadSpeakingProfile(user.uid);
    const member = await submitJoinRequest({
      room,
      profile,
      introAudioPath: saved.audioPath,
      introTranscript: readOptionalText(audio.fields.get('transcript'), 8000),
      introSuggestion: readOptionalText(audio.fields.get('suggestion'), 2000),
      introDurationSec: readDuration(audio.fields.get('durationSec')),
    });
    await notifyReviewers({ room, applicant: member });
    return NextResponse.json({ member });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
