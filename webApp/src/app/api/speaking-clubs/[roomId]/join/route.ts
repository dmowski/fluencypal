import { NextResponse } from 'next/server';
import {
  loadSpeakingProfile,
  markVoiceNoticeSeen,
  requireSpeakingUser,
} from '@/features/Chat/VoiceChat/backend/access';
import { readAudioFile, readDuration } from '@/features/Chat/VoiceChat/backend/forms';
import {
  readOptionalText,
  SpeakingClubError,
  speakingClubErrorResponse,
} from '@/features/Chat/VoiceChat/backend/http';
import { getRoomMember, submitJoinRequest } from '@/features/Chat/VoiceChat/backend/members';
import { notifyReviewers } from '@/features/Chat/VoiceChat/backend/notifications';
import { assertSpeakingRate } from '@/features/Chat/VoiceChat/backend/rateLimit';
import { getSpeakingRoom } from '@/features/Chat/VoiceChat/backend/rooms';
import { deleteSpeakingAudio, saveSpeakingAudio } from '@/features/Chat/VoiceChat/backend/storage';

export async function POST(request: Request, context: { params: Promise<{ roomId: string }> }) {
  try {
    const user = await requireSpeakingUser(request);
    const { roomId } = await context.params;
    const room = await getSpeakingRoom(roomId);
    if (!room) return NextResponse.json({ error: 'That room is not here.' }, { status: 404 });
    const existing = await getRoomMember(roomId, user.uid);
    if (existing?.status === 'approved') {
      throw new SpeakingClubError('You are already in this room.');
    }
    if (existing?.status === 'pending') {
      throw new SpeakingClubError('Your introduction is already being reviewed.');
    }
    const audio = await readAudioFile(request);
    await assertSpeakingRate(user.uid, 'intro');
    let audioPath = '';
    let stored = false;
    try {
      const saved = await saveSpeakingAudio({
        folder: `${roomId}/intros`,
        id: user.uid,
        buffer: audio.buffer,
        contentType: audio.contentType,
      });
      audioPath = saved.audioPath;
      if (existing?.introAudioPath && existing.introAudioPath !== audioPath) {
        await deleteSpeakingAudio(existing.introAudioPath);
      }
      const profile = await loadSpeakingProfile(user.uid);
      const member = await submitJoinRequest({
        room,
        profile,
        introAudioPath: audioPath,
        introTranscript: readOptionalText(audio.fields.get('transcript'), 8000),
        introSuggestion: readOptionalText(audio.fields.get('suggestion'), 2000),
        introDurationSec: readDuration(audio.fields.get('durationSec'), audio.buffer.length),
      });
      stored = true;
      await notifyReviewers({ room, applicant: member });
      await markVoiceNoticeSeen(user.uid);
      return NextResponse.json({ member });
    } catch (error) {
      if (audioPath && !stored) await deleteSpeakingAudio(audioPath);
      throw error;
    }
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
