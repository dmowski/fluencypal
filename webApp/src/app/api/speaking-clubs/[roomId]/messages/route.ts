import { NextResponse } from 'next/server';
import {
  loadSpeakingProfile,
  markVoiceNoticeSeen,
  requireSpeakingUser,
} from '@/features/Chat/VoiceChat/backend/access';
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
import { assertSpeakingRate } from '@/features/Chat/VoiceChat/backend/rateLimit';
import { getSpeakingRoom } from '@/features/Chat/VoiceChat/backend/rooms';
import { deleteSpeakingAudio, saveSpeakingAudio } from '@/features/Chat/VoiceChat/backend/storage';

export async function GET(request: Request, context: { params: Promise<{ roomId: string }> }) {
  try {
    const user = await requireSpeakingUser(request);
    const { roomId } = await context.params;
    await assertApprovedMember(roomId, user.uid);
    const messages = await listRoomMessages(roomId, user.uid, { includePrivate: true });
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
    await assertApprovedMember(roomId, user.uid);
    const audio = await readAudioFile(request);
    await assertSpeakingRate(user.uid, 'message');
    let audioPath = '';
    let stored = false;
    try {
      const saved = await saveSpeakingAudio({
        folder: `${roomId}/messages`,
        id: `${user.uid}-${Date.now()}`,
        buffer: audio.buffer,
        contentType: audio.contentType,
      });
      audioPath = saved.audioPath;
      const profile = await loadSpeakingProfile(user.uid);
      const message = await createRoomMessage({
        room,
        profile,
        audioPath,
        durationSec: readDuration(audio.fields.get('durationSec'), audio.buffer.length),
        transcript: readOptionalText(audio.fields.get('transcript'), 8000),
        correctedTranscript: readOptionalText(audio.fields.get('correctedTranscript'), 8000),
      });
      stored = true;
      await markRoomRead(user.uid, roomId);
      await markVoiceNoticeSeen(user.uid);
      return NextResponse.json({ message });
    } catch (error) {
      if (audioPath && !stored) await deleteSpeakingAudio(audioPath);
      throw error;
    }
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
