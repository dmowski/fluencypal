import { NextResponse } from 'next/server';
import { loadSpeakingProfile, requireSpeakingUser } from '@/features/Chat/VoiceChat/backend/access';
import { parseRoomDraft } from '@/features/Chat/VoiceChat/backend/forms';
import {
  asRecord,
  readJson,
  speakingClubErrorResponse,
} from '@/features/Chat/VoiceChat/backend/http';
import { notifyNewRoom } from '@/features/Chat/VoiceChat/backend/notifications';
import { assertSpeakingRate } from '@/features/Chat/VoiceChat/backend/rateLimit';
import { createSpeakingRoom, listRoomsForUser } from '@/features/Chat/VoiceChat/backend/rooms';

export async function GET(request: Request) {
  try {
    const user = await requireSpeakingUser(request);
    const rooms = await listRoomsForUser({ userId: user.uid, email: user.email });
    const profile = await loadSpeakingProfile(user.uid);
    return NextResponse.json({ rooms, prefs: profile.prefs, bio: profile.bio });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireSpeakingUser(request);
    const input = parseRoomDraft(asRecord(await readJson(request)));
    await assertSpeakingRate(user.uid, 'room');
    const profile = await loadSpeakingProfile(user.uid);
    const room = await createSpeakingRoom({
      creatorId: user.uid,
      username: profile.username,
      avatarUrl: profile.avatarUrl,
      input,
    });
    await notifyNewRoom(room, user.uid);
    return NextResponse.json({ room });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
