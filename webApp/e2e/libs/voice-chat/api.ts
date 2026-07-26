import type { EmulatorTestUser } from './auth';
import { adminFirestore, seedVoiceChatMessage } from './admin';

const VOICE_CHAT_MESSAGE_TTL_DAYS = 4;

const BASE_URL = 'http://localhost:3000';

type VoiceChatStatusResponse = {
  isEntitled: boolean;
  isPaid: boolean;
  isGameWinner: boolean;
  isApprover: boolean;
  member: { status: string; userId: string } | null;
  canRequestAccess: boolean;
  reRequestAvailableAtIso: string | null;
  unreadCount: number;
  pendingMembers: { userId: string }[];
};

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

const fakeAudioBlob = () => new Blob(['e2e-voice-chat-audio'], { type: 'audio/webm' });

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

export const refreshIdToken = async (refreshToken: string): Promise<string> => {
  const response = await fetch(
    `http://127.0.0.1:9099/securetoken.googleapis.com/v1/token?key=fake-api-key`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grant_type: 'refresh_token', refresh_token: refreshToken }),
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to refresh token: ${response.status}`);
  }
  const json = (await response.json()) as { id_token: string };
  return json.id_token;
};

export const validatePaidForUser = async (token: string, userId?: string): Promise<void> => {
  await parseJson(
    await fetch(`${BASE_URL}/api/voice-chat/validate-paid`, {
      method: 'POST',
      headers: {
        ...authHeaders(token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userId ? { userId } : {}),
    }),
  );
};

export const requestVoiceChatAccess = async (
  user: Pick<EmulatorTestUser, 'idToken'>,
  durationSec = 6,
): Promise<{ userId: string }> => {
  const form = new FormData();
  form.append('audio', fakeAudioBlob(), 'intro.webm');
  form.append('durationSec', String(durationSec));
  const data = await parseJson<{ member: { userId: string } }>(
    await fetch(`${BASE_URL}/api/voice-chat/request-access`, {
      method: 'POST',
      headers: authHeaders(user.idToken),
      body: form,
    }),
  );
  return { userId: data.member.userId };
};

export const decideVoiceChatMembership = async (params: {
  approverToken: string;
  targetUserId: string;
  decision: 'approved' | 'rejected';
}): Promise<void> => {
  await parseJson(
    await fetch(`${BASE_URL}/api/voice-chat/decide`, {
      method: 'POST',
      headers: {
        ...authHeaders(params.approverToken),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        targetUserId: params.targetUserId,
        decision: params.decision,
      }),
    }),
  );
};

export const fetchVoiceChatStatus = async (token: string): Promise<VoiceChatStatusResponse> =>
  parseJson(
    await fetch(`${BASE_URL}/api/voice-chat/status`, {
      headers: authHeaders(token),
    }),
  );

export const fetchVoiceChatMessages = async (token: string) =>
  parseJson<{ messages: { id: string; senderId: string; isIntro?: boolean }[] }>(
    await fetch(`${BASE_URL}/api/voice-chat/messages`, {
      headers: authHeaders(token),
    }),
  );

export const sendVoiceChatMessage = async (params: {
  token: string;
  parentMessageId?: string;
  durationSec?: number;
}): Promise<{ id: string }> => {
  const form = new FormData();
  form.append('audio', fakeAudioBlob(), 'message.webm');
  form.append('durationSec', String(params.durationSec ?? 2));
  form.append('parentMessageId', params.parentMessageId ?? '');
  const data = await parseJson<{ message: { id: string } }>(
    await fetch(`${BASE_URL}/api/voice-chat/messages`, {
      method: 'POST',
      headers: authHeaders(params.token),
      body: form,
    }),
  );
  return { id: data.message.id };
};

export const deleteVoiceChatMessage = async (params: {
  token: string;
  messageId: string;
}): Promise<void> => {
  await parseJson(
    await fetch(`${BASE_URL}/api/voice-chat/messages/${params.messageId}`, {
      method: 'DELETE',
      headers: authHeaders(params.token),
    }),
  );
};

export const markVoiceChatListened = async (params: {
  token: string;
  messageId: string;
}): Promise<void> => {
  await parseJson(
    await fetch(`${BASE_URL}/api/voice-chat/mark-listened`, {
      method: 'POST',
      headers: {
        ...authHeaders(params.token),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messageId: params.messageId }),
    }),
  );
};

export const expectVoiceChatApiError = async (
  response: Response,
  expectedStatus: number,
): Promise<void> => {
  if (response.status !== expectedStatus) {
    const body = await response.text();
    throw new Error(`Expected HTTP ${expectedStatus}, got ${response.status}: ${body}`);
  }
};

export const fetchVoiceChatMessagesRaw = (token: string) =>
  fetch(`${BASE_URL}/api/voice-chat/messages`, {
    headers: authHeaders(token),
  });

export const runVoiceChatCleanup = async (): Promise<{ deletedIds: string[] }> =>
  parseJson(
    await fetch(`${BASE_URL}/api/voice-chat/cleanup`, {
      method: 'GET',
    }),
  );

/** Seed an expired root message for cleanup cron tests. */
export const seedExpiredVoiceChatMessage = async (params: {
  messageId: string;
  senderId: string;
  ttlDays?: number;
}): Promise<void> => {
  const ttlDays = params.ttlDays ?? VOICE_CHAT_MESSAGE_TTL_DAYS;
  const createdAtUtc = Date.now() - (ttlDays + 1) * 24 * 60 * 60 * 1000;
  const audioPath = `voiceChat/audio/${params.messageId}.webm`;

  await seedVoiceChatMessage({
    id: params.messageId,
    senderId: params.senderId,
    audioPath,
    durationSec: 3,
    createdAtUtc,
  });
};

export const getVoiceChatMessageIds = async (): Promise<string[]> => {
  const snap = await adminFirestore().collection('voiceChatMessages').get();
  return snap.docs.map((doc) => doc.id);
};

export const approvePaidUser = async (params: {
  approver: Pick<EmulatorTestUser, 'idToken'>;
  applicant: Pick<EmulatorTestUser, 'uid' | 'idToken'>;
}): Promise<void> => {
  await requestVoiceChatAccess(params.applicant);
  await decideVoiceChatMembership({
    approverToken: params.approver.idToken,
    targetUserId: params.applicant.uid,
    decision: 'approved',
  });
};
