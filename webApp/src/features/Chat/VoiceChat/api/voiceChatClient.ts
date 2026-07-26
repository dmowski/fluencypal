import {
  VoiceChatApiError,
  VoiceChatDecideRequest,
  VoiceChatDecideResponse,
  VoiceChatDeleteMessageResponse,
  VoiceChatListMessagesResponse,
  VoiceChatMarkListenedRequest,
  VoiceChatMarkListenedResponse,
  VoiceChatMember,
  VoiceChatMessage,
  VoiceChatRequestAccessResponse,
  VoiceChatSendMessageResponse,
  VoiceChatStatusResponse,
} from '../types';

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
});

async function parseJson<T>(response: Response): Promise<T> {
  const data: unknown = await response.json();
  if (!response.ok) {
    const error =
      typeof data === 'object' &&
      data !== null &&
      'error' in data &&
      typeof (data as VoiceChatApiError).error === 'string'
        ? (data as VoiceChatApiError).error
        : `Request failed (${response.status})`;
    throw new Error(error);
  }
  return data as T;
}

async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  const data: unknown = await response.json().catch(() => ({}));
  if (
    typeof data === 'object' &&
    data !== null &&
    'error' in data &&
    typeof (data as VoiceChatApiError).error === 'string'
  ) {
    return (data as VoiceChatApiError).error;
  }
  return fallback;
}

export const fetchVoiceChatStatus = async (token: string): Promise<VoiceChatStatusResponse> => {
  const response = await fetch('/api/voice-chat/status', {
    headers: authHeaders(token),
  });
  return parseJson<VoiceChatStatusResponse>(response);
};

export const requestVoiceChatAccess = async (params: {
  token: string;
  audioBlob: Blob;
  durationSec: number;
}): Promise<VoiceChatMember> => {
  const form = new FormData();
  form.append('audio', params.audioBlob, 'intro.webm');
  form.append('durationSec', String(params.durationSec));
  const response = await fetch('/api/voice-chat/request-access', {
    method: 'POST',
    headers: authHeaders(params.token),
    body: form,
  });
  const data = await parseJson<VoiceChatRequestAccessResponse>(response);
  return data.member;
};

export const decideVoiceChatMembership = async (
  params: VoiceChatDecideRequest & { token: string },
): Promise<VoiceChatMember> => {
  const body: VoiceChatDecideRequest = {
    targetUserId: params.targetUserId,
    decision: params.decision,
  };
  const response = await fetch('/api/voice-chat/decide', {
    method: 'POST',
    headers: {
      ...authHeaders(params.token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await parseJson<VoiceChatDecideResponse>(response);
  return data.member;
};

export const fetchVoiceChatMessages = async (
  token: string,
): Promise<VoiceChatListMessagesResponse> => {
  const response = await fetch('/api/voice-chat/messages', {
    headers: authHeaders(token),
  });
  return parseJson<VoiceChatListMessagesResponse>(response);
};

export const sendVoiceChatMessage = async (params: {
  token: string;
  audioBlob: Blob;
  durationSec: number;
  parentMessageId: string;
}): Promise<VoiceChatMessage> => {
  const form = new FormData();
  form.append('audio', params.audioBlob, 'message.webm');
  form.append('durationSec', String(params.durationSec));
  form.append('parentMessageId', params.parentMessageId);
  const response = await fetch('/api/voice-chat/messages', {
    method: 'POST',
    headers: authHeaders(params.token),
    body: form,
  });
  const data = await parseJson<VoiceChatSendMessageResponse>(response);
  return data.message;
};

export const deleteVoiceChatMessage = async (params: {
  token: string;
  messageId: string;
}): Promise<VoiceChatDeleteMessageResponse> => {
  const response = await fetch(`/api/voice-chat/messages/${params.messageId}`, {
    method: 'DELETE',
    headers: authHeaders(params.token),
  });
  return parseJson<VoiceChatDeleteMessageResponse>(response);
};

export const markVoiceChatListened = async (
  params: VoiceChatMarkListenedRequest & { token: string },
): Promise<VoiceChatMarkListenedResponse> => {
  const body: VoiceChatMarkListenedRequest = { messageId: params.messageId };
  const response = await fetch('/api/voice-chat/mark-listened', {
    method: 'POST',
    headers: {
      ...authHeaders(params.token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return parseJson<VoiceChatMarkListenedResponse>(response);
};

export const fetchVoiceChatAudioBlob = async (params: {
  token: string;
  messageId: string;
}): Promise<Blob> => {
  const response = await fetch(`/api/voice-chat/messages/${params.messageId}/audio`, {
    headers: authHeaders(params.token),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, 'Failed to load audio'));
  }
  return response.blob();
};

export const fetchPendingIntroAudioBlob = async (params: {
  token: string;
  userId: string;
}): Promise<Blob> => {
  const response = await fetch(`/api/voice-chat/pending/${params.userId}/intro-audio`, {
    headers: authHeaders(params.token),
  });
  if (!response.ok) {
    throw new Error(await parseErrorMessage(response, 'Failed to load intro'));
  }
  return response.blob();
};
