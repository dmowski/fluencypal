import { avatars } from '@/features/Game/avatars';
import type { VoiceChatMember, VoiceChatMessage } from './types';

/** Minimal silent WAV so the player renders enabled controls in screenshots. */
export const SILENT_AUDIO_DATA_URL =
  'data:audio/wav;base64,T2dnUwACAAAAAAAAAAA8TEFNRTI8LgA4AC9tcmVmAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP//';

/** Local copy of the production card preview — deterministic for UX screenshots. */
export const FIXTURE_PREVIEW_IMAGE_URL = new URL(
  './screenshots/fixture-preview.png',
  import.meta.url,
).href;

export const FIXTURE_CURRENT_USER = 'alice-voice-user';
export const FIXTURE_OTHER_USER = 'bob-voice-user';
export const FIXTURE_THIRD_USER = 'charlie-voice-user';

export const FIXTURE_MEMBER_USER_IDS = [
  FIXTURE_CURRENT_USER,
  FIXTURE_OTHER_USER,
  FIXTURE_THIRD_USER,
];

/** Alice + Bob online (< 5 min); Charlie offline. */
export const FIXTURE_GAME_LAST_VISIT: Record<string, string> = {
  [FIXTURE_CURRENT_USER]: new Date().toISOString(),
  [FIXTURE_OTHER_USER]: new Date().toISOString(),
};

export const FIXTURE_USER_PROFILES: Record<string, { name: string; avatar: string }> = {
  [FIXTURE_CURRENT_USER]: { name: 'Alice', avatar: avatars[0] ?? '' },
  [FIXTURE_OTHER_USER]: { name: 'Bob', avatar: avatars[1] ?? '' },
  [FIXTURE_THIRD_USER]: { name: 'Charlie', avatar: avatars[2] ?? '' },
  'pending-user-001': { name: 'Dana', avatar: avatars[3] ?? '' },
};

export const FIXTURE_CONVERSATION: VoiceChatMessage[] = [
  {
    id: 'msg-bob-intro',
    senderId: FIXTURE_OTHER_USER,
    parentMessageId: '',
    audioPath: 'voiceChat/audio/bob-intro.webm',
    durationSec: 142,
    contentType: 'audio/webm',
    createdAtIso: '2026-07-28T10:00:00.000Z',
    createdAtUtc: 1785232800000,
    isIntro: true,
  },
  {
    id: 'msg-alice-reply',
    senderId: FIXTURE_CURRENT_USER,
    parentMessageId: 'msg-bob-intro',
    audioPath: 'voiceChat/audio/alice-reply.webm',
    durationSec: 38,
    contentType: 'audio/webm',
    createdAtIso: '2026-07-28T11:15:00.000Z',
    createdAtUtc: 1785237300000,
  },
  {
    id: 'msg-bob-nested',
    senderId: FIXTURE_OTHER_USER,
    parentMessageId: 'msg-alice-reply',
    audioPath: 'voiceChat/audio/bob-nested.webm',
    durationSec: 52,
    contentType: 'audio/webm',
    createdAtIso: '2026-07-28T12:00:00.000Z',
    createdAtUtc: 1785240000000,
  },
  {
    id: 'msg-charlie-root',
    senderId: FIXTURE_THIRD_USER,
    parentMessageId: '',
    audioPath: 'voiceChat/audio/charlie-root.webm',
    durationSec: 24,
    contentType: 'audio/webm',
    createdAtIso: '2026-07-29T09:30:00.000Z',
    createdAtUtc: 1785317400000,
  },
];

export const FIXTURE_LISTENED_IDS = new Set(['msg-bob-intro', 'msg-alice-reply']);

export const FIXTURE_PENDING_MEMBER: VoiceChatMember = {
  userId: 'pending-user-001',
  status: 'pending',
  introAudioPath: 'voiceChat/audio/pending-intro.webm',
  introDurationSec: 165,
  introContentType: 'audio/webm',
  requestedAtIso: '2026-07-30T14:22:00.000Z',
};

export const noopAsync = async () => {};
