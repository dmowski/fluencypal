import { NextResponse } from 'next/server';
import { VoiceChatAccessError } from './access';
import {
  VOICE_CHAT_INTRO_MIN_SECONDS,
  VoiceChatApiError,
  VoiceChatDecideRequest,
  VoiceChatDecision,
  VoiceChatMarkListenedRequest,
  VoiceChatRequestAccessForm,
  VoiceChatSendMessageForm,
  VoiceChatValidatePaidRequest,
} from '../types';

export const voiceChatErrorResponse = (error: unknown) => {
  if (error instanceof VoiceChatAccessError) {
    return NextResponse.json<VoiceChatApiError>(
      { error: error.message },
      { status: error.status },
    );
  }
  const message = error instanceof Error ? error.message : 'Unknown error';
  if (message === 'Invalid token' || message.includes('Authorization')) {
    return NextResponse.json<VoiceChatApiError>({ error: 'Unauthorized' }, { status: 401 });
  }
  console.error('Voice chat error', error);
  return NextResponse.json<VoiceChatApiError>({ error: message }, { status: 500 });
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const readJsonUnknown = async (request: Request): Promise<unknown> => {
  try {
    return await request.json();
  } catch {
    throw new VoiceChatAccessError('Invalid JSON body', 400);
  }
};

const readOptionalJsonUnknown = async (request: Request): Promise<unknown> => {
  try {
    return await request.json();
  } catch {
    return {};
  }
};

const requireNonEmptyString = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !value.trim()) {
    throw new VoiceChatAccessError(`${field} is required`, 400);
  }
  return value;
};

const parseDecision = (value: unknown): VoiceChatDecision => {
  if (value !== 'approved' && value !== 'rejected') {
    throw new VoiceChatAccessError('targetUserId and decision are required', 400);
  }
  return value;
};

const parseDurationSec = (value: FormDataEntryValue | null, minSeconds: number): number => {
  const durationSec = Number(value || 0);
  if (!Number.isFinite(durationSec) || durationSec < minSeconds) {
    throw new VoiceChatAccessError(
      minSeconds >= 5 ? 'Intro recording is too short' : 'Recording is too short',
      400,
    );
  }
  return durationSec;
};

const requireAudioFile = (value: FormDataEntryValue | null): File => {
  if (!(value instanceof File)) {
    throw new VoiceChatAccessError('audio file is required', 400);
  }
  return value;
};

export const parseDecideRequest = async (request: Request): Promise<VoiceChatDecideRequest> => {
  const body = await readJsonUnknown(request);
  if (!isRecord(body)) {
    throw new VoiceChatAccessError('targetUserId and decision are required', 400);
  }
  if (typeof body.targetUserId !== 'string' || !body.targetUserId.trim()) {
    throw new VoiceChatAccessError('targetUserId and decision are required', 400);
  }
  return {
    targetUserId: body.targetUserId,
    decision: parseDecision(body.decision),
  };
};

export const parseMarkListenedRequest = async (
  request: Request,
): Promise<VoiceChatMarkListenedRequest> => {
  const body = await readJsonUnknown(request);
  if (!isRecord(body)) {
    throw new VoiceChatAccessError('messageId is required', 400);
  }
  return {
    messageId: requireNonEmptyString(body.messageId, 'messageId'),
  };
};

export const parseValidatePaidRequest = async (
  request: Request,
): Promise<VoiceChatValidatePaidRequest> => {
  const body = await readOptionalJsonUnknown(request);
  if (!isRecord(body)) {
    return {};
  }
  if (body.userId === undefined) {
    return {};
  }
  if (typeof body.userId !== 'string' || !body.userId.trim()) {
    throw new VoiceChatAccessError('userId must be a non-empty string', 400);
  }
  return { userId: body.userId };
};

export const parseRequestAccessForm = async (
  request: Request,
): Promise<VoiceChatRequestAccessForm> => {
  const form = await request.formData();
  return {
    audio: requireAudioFile(form.get('audio')),
    durationSec: parseDurationSec(form.get('durationSec'), VOICE_CHAT_INTRO_MIN_SECONDS),
  };
};

export const parseSendMessageForm = async (request: Request): Promise<VoiceChatSendMessageForm> => {
  const form = await request.formData();
  const parentRaw = form.get('parentMessageId');
  return {
    audio: requireAudioFile(form.get('audio')),
    durationSec: parseDurationSec(form.get('durationSec'), 1),
    parentMessageId: typeof parentRaw === 'string' ? parentRaw : '',
  };
};
