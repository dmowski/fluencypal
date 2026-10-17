import { NextResponse } from 'next/server';
import { loadSpeakingProfile, requireSpeakingUser } from '@/features/Chat/VoiceChat/backend/access';
import { readAudioFile, readDuration } from '@/features/Chat/VoiceChat/backend/forms';
import {
  readOptionalText,
  speakingClubErrorResponse,
} from '@/features/Chat/VoiceChat/backend/http';
import {
  assertApprovedMember,
  createRoomMessage,
  listRoomMessages,
} from '@/features/Chat/VoiceChat/backend/messages';
import { markRoomRead } from '@/features/Chat/VoiceChat/backend/notifications';
import { getSpeakingRoom } from '@/features/Chat/VoiceChat/backend/rooms';
import { saveSpeakingAudio } from '@/features/Chat/VoiceChat/backend/storage';

export async function GET(request: Request, context: { params: Promise<{ roomId: string }> }) {
  try {
    const user = await requireSpeakingUser(request);
    const { roomId } = await context.params;
    await assertApprovedMember(roomId, user.uid);
    const messages = await listRoomMessages(roomId);
    await markRoomRead(user.uid, roomId);
    return NextResponse.json({ messages });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}

export async function POST(request: Request, context: { params: Promise<{ roomId: string }> }) {
  try {
    const user = await requireSpeakingUser(request);
    const { roomId } = await context.params;
    const room = await getSpeakingRoom(roomId);
    if (!room) return NextResponse.json({ error: 'That room is not here.' }, { status: 404 });
    const audio = await readAudioFile(request);
    const saved = await saveSpeakingAudio({
      folder: `${roomId}/messages`,
      id: `${user.uid}-${Date.now()}`,
      buffer: audio.buffer,
      contentType: audio.contentType,
    });
    const profile = await loadSpeakingProfile(user.uid);
    const message = await createRoomMessage({
      room,
      profile,
      audioPath: saved.audioPath,
      durationSec: readDuration(audio.fields.get('durationSec')),
      transcript: readOptionalText(audio.fields.get('transcript'), 8000),
      correctedTranscript: readOptionalText(audio.fields.get('correctedTranscript'), 8000),
    });
    await markRoomRead(user.uid, roomId);
    return NextResponse.json({ message });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
