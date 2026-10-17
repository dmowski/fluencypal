import { NextResponse } from 'next/server';
import {
  loadRoomNarrowing,
  loadSpeakingProfile,
  requireSpeakingUser,
} from '@/features/Chat/VoiceChat/backend/access';
import {
  asRecord,
  readJson,
  speakingClubErrorResponse,
} from '@/features/Chat/VoiceChat/backend/http';
import {
  saveGlobalPrefs,
  saveRoomNarrowing,
} from '@/features/Chat/VoiceChat/backend/notifications';
import {
  defaultRoomNarrowing,
  parseRoomNarrowing,
  parseSpeakingNotificationPrefs,
} from '@/features/Chat/VoiceChat/notificationRules';
import { isRoomSlug } from '@/features/Chat/VoiceChat/slug';

export async function GET(request: Request) {
  try {
    const user = await requireSpeakingUser(request);
    const roomId = new URL(request.url).searchParams.get('roomId') || '';
    const profile = await loadSpeakingProfile(user.uid);
    const narrowing =
      roomId && isRoomSlug(roomId) ? await loadRoomNarrowing(user.uid, roomId) : null;
    return NextResponse.json({ prefs: profile.prefs, narrowing });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await requireSpeakingUser(request);
    const body = asRecord(await readJson(request));
    const roomId = typeof body.roomId === 'string' ? body.roomId : '';
    if (roomId) {
      if (!isRoomSlug(roomId)) {
        return NextResponse.json({ error: 'That room is not here.' }, { status: 404 });
      }
      const narrowing = parseRoomNarrowing(body.narrowing);
      await saveRoomNarrowing(user.uid, roomId, narrowing);
      return NextResponse.json({ narrowing });
    }
    const current = await loadSpeakingProfile(user.uid);
    const next = parseSpeakingNotificationPrefs({
      ...current.prefs,
      ...(body.prefs && typeof body.prefs === 'object' ? body.prefs : {}),
    });
    if (!body.prefs) {
      return NextResponse.json({ prefs: current.prefs, narrowing: defaultRoomNarrowing() });
    }
    await saveGlobalPrefs(user.uid, next);
    return NextResponse.json({ prefs: next });
  } catch (error) {
    return speakingClubErrorResponse(error);
  }
}
