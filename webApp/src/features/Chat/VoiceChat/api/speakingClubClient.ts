import {
  AppNotification,
  PublicSpeakingClub,
  RoomDraft,
  RoomListItem,
  RoomMember,
  RoomMessage,
  RoomNotificationNarrowing,
  SpeakingNotificationPrefs,
  SpeakingRoom,
} from '../types';

const readError = async (response: Response): Promise<string> => {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || 'Something went wrong. Please try again.';
  } catch {
    return 'Something went wrong. Please try again.';
  }
};

const authedJson = async <T>(path: string, token: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(path, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...init?.headers,
    },
  });
  if (!response.ok) throw new Error(await readError(response));
  return (await response.json()) as T;
};

export const fetchSpeakingRooms = (token: string) =>
  authedJson<{ rooms: RoomListItem[]; prefs: SpeakingNotificationPrefs }>(
    '/api/speaking-clubs',
    token,
  );

export const createSpeakingRoom = (token: string, draft: RoomDraft) =>
  authedJson<{ room: SpeakingRoom }>('/api/speaking-clubs', token, {
    method: 'POST',
    body: JSON.stringify({
      title: draft.title,
      subtitle: draft.subtitle,
      reviewMode: draft.reviewMode,
      joinPromptMarkdown: draft.joinPromptMarkdown,
      isPublic: draft.isPublic,
      rulesMarkdown: draft.rulesMarkdown,
      discussMarkdown: draft.discussMarkdown,
      selectedPreviewUrl: draft.selectedPreviewUrl,
    }),
  });

export const updateSpeakingRoom = (token: string, roomId: string, draft: RoomDraft) =>
  authedJson<{ room: SpeakingRoom }>(`/api/speaking-clubs/${roomId}`, token, {
    method: 'PATCH',
    body: JSON.stringify({
      title: draft.title,
      subtitle: draft.subtitle,
      reviewMode: draft.reviewMode,
      joinPromptMarkdown: draft.joinPromptMarkdown,
      isPublic: draft.isPublic,
      rulesMarkdown: draft.rulesMarkdown,
      discussMarkdown: draft.discussMarkdown,
      selectedPreviewUrl: draft.selectedPreviewUrl,
    }),
  });

export interface RoomDetail {
  room: SpeakingRoom;
  membership: RoomMember | null;
  members: RoomMember[];
  messages: RoomMessage[];
  isAdmin: boolean;
  canReview: boolean;
}

export const fetchRoomDetail = (token: string, roomId: string) =>
  authedJson<RoomDetail>(`/api/speaking-clubs/${roomId}`, token);

export const generateRoomPreviews = (token: string, title: string, subtitle: string) =>
  authedJson<{ urls: string[] }>('/api/speaking-clubs/previews', token, {
    method: 'POST',
    body: JSON.stringify({ title, subtitle, count: 3 }),
  });

export const fetchNotificationSettings = (token: string, roomId?: string) => {
  const query = roomId ? `?roomId=${encodeURIComponent(roomId)}` : '';
  return authedJson<{
    prefs: SpeakingNotificationPrefs;
    narrowing: RoomNotificationNarrowing | null;
  }>(`/api/speaking-clubs/notifications${query}`, token);
};

export const saveNotificationSettings = (
  token: string,
  body: {
    prefs?: SpeakingNotificationPrefs;
    roomId?: string;
    narrowing?: RoomNotificationNarrowing;
  },
) =>
  authedJson<{ prefs?: SpeakingNotificationPrefs; narrowing?: RoomNotificationNarrowing }>(
    '/api/speaking-clubs/notifications',
    token,
    { method: 'PATCH', body: JSON.stringify(body) },
  );

const audioForm = (params: {
  blob: Blob;
  durationSec: number;
  transcript: string;
  extra?: Record<string, string>;
}) => {
  const form = new FormData();
  form.set('audio', params.blob, 'voice.webm');
  form.set('durationSec', String(params.durationSec));
  form.set('transcript', params.transcript);
  for (const [key, value] of Object.entries(params.extra || {})) form.set(key, value);
  return form;
};

export const sendRoomVoiceMessage = (
  token: string,
  roomId: string,
  params: { blob: Blob; durationSec: number; transcript: string; correctedTranscript: string },
) =>
  authedJson<{ message: RoomMessage }>(`/api/speaking-clubs/${roomId}/messages`, token, {
    method: 'POST',
    body: audioForm({
      ...params,
      extra: { correctedTranscript: params.correctedTranscript },
    }),
  });

export const deleteRoomMessage = (token: string, roomId: string, messageId: string) =>
  authedJson<{ ok: true }>(`/api/speaking-clubs/${roomId}/messages/${messageId}`, token, {
    method: 'DELETE',
  });

export const submitRoomJoin = (
  token: string,
  roomId: string,
  params: { blob: Blob; durationSec: number; transcript: string; suggestion: string },
) =>
  authedJson<{ member: RoomMember }>(`/api/speaking-clubs/${roomId}/join`, token, {
    method: 'POST',
    body: audioForm({
      blob: params.blob,
      durationSec: params.durationSec,
      transcript: params.transcript,
      extra: { suggestion: params.suggestion },
    }),
  });

export const reviewRoomMember = (
  token: string,
  roomId: string,
  targetUserId: string,
  decision: 'approved' | 'rejected',
) =>
  authedJson<{ member: RoomMember }>(`/api/speaking-clubs/${roomId}/review`, token, {
    method: 'POST',
    body: JSON.stringify({ targetUserId, decision }),
  });

export const markSpeakingRoomRead = (token: string, roomId: string) =>
  authedJson<{ ok: true }>(`/api/speaking-clubs/${roomId}/read`, token, { method: 'POST' });

export const fetchSpeakingAudio = async (token: string, path: string): Promise<string> => {
  const response = await fetch(path, { headers: { Authorization: `Bearer ${token}` } });
  if (!response.ok) throw new Error(await readError(response));
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

export const messageAudioPath = (roomId: string, messageId: string) =>
  `/api/speaking-clubs/${roomId}/messages/${messageId}/audio`;

export const introAudioPath = (roomId: string, userId: string) =>
  `/api/speaking-clubs/${roomId}/members/${userId}/audio`;

export type { AppNotification, PublicSpeakingClub };
