import { sendTranscriptRequest } from '@/app/api/transcript/sendTranscriptRequest';
import { isAliasGameRolePlay } from '@/features/RolePlay/aliasAnalytics';

const GUEST_REPLY_TEXT_KEY = 'fp:rolePlayGuestReplyText';

export type RolePlayGuestReplyRecording = {
  rolePlayId: string;
  blob: Blob;
  format: string;
  durationSec: number;
};

type RolePlayGuestReplyText = {
  rolePlayId: string;
  transcript: string;
};

let pendingRecording: RolePlayGuestReplyRecording | null = null;

const readStoredText = (): RolePlayGuestReplyText | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(GUEST_REPLY_TEXT_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as RolePlayGuestReplyText;
    if (!parsed?.rolePlayId || typeof parsed.transcript !== 'string') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const writeStoredText = (value: RolePlayGuestReplyText | null): void => {
  if (typeof window === 'undefined') {
    return;
  }

  if (!value) {
    window.sessionStorage.removeItem(GUEST_REPLY_TEXT_KEY);
    return;
  }

  window.sessionStorage.setItem(GUEST_REPLY_TEXT_KEY, JSON.stringify(value));
};

export const saveGuestReplyRecording = (recording: RolePlayGuestReplyRecording): void => {
  pendingRecording = recording;
};

export const peekGuestReplyRecording = (): RolePlayGuestReplyRecording | null => pendingRecording;

export const hasGuestReply = (rolePlayId: string): boolean => {
  if (!rolePlayId) {
    return false;
  }
  if (pendingRecording?.rolePlayId === rolePlayId) {
    return true;
  }
  return readStoredText()?.rolePlayId === rolePlayId;
};

export const clearGuestReply = (rolePlayId?: string): void => {
  if (!rolePlayId) {
    pendingRecording = null;
    writeStoredText(null);
    return;
  }

  if (pendingRecording?.rolePlayId === rolePlayId) {
    pendingRecording = null;
  }

  const stored = readStoredText();
  if (stored?.rolePlayId === rolePlayId) {
    writeStoredText(null);
  }
};

export const shouldInjectGuestReply = (rolePlayId: string): boolean => {
  return Boolean(rolePlayId) && !isAliasGameRolePlay(rolePlayId);
};

export const appendGuestReplyToInstruction = (instruction: string, transcript: string): string => {
  const reply = transcript.trim();
  if (!reply) {
    return instruction;
  }

  return `${instruction}

The learner already heard your opening line and replied:
"${reply}"

Continue the scene from that reply. Do not repeat the opening greeting.`;
};

export const consumeGuestReplyTranscript = async (input: {
  rolePlayId: string;
  getToken: () => Promise<string>;
  languageCode: string;
}): Promise<string | null> => {
  const stored = readStoredText();
  if (stored?.rolePlayId === input.rolePlayId && stored.transcript.trim()) {
    writeStoredText(null);
    pendingRecording = pendingRecording?.rolePlayId === input.rolePlayId ? null : pendingRecording;
    return stored.transcript.trim();
  }

  const recording = pendingRecording?.rolePlayId === input.rolePlayId ? pendingRecording : null;
  if (!recording) {
    return null;
  }

  const token = await input.getToken();
  if (!token) {
    return null;
  }

  try {
    const result = await sendTranscriptRequest({
      audioBlob: recording.blob,
      authKey: token,
      languageCode: input.languageCode,
      audioDuration: recording.durationSec || 5,
      format: recording.format,
    });
    const transcript = result.transcript?.trim() || '';
    if (!transcript) {
      return null;
    }
    pendingRecording = null;
    return transcript;
  } catch {
    return null;
  }
};

export const resetGuestReplyForTests = (): void => {
  pendingRecording = null;
  writeStoredText(null);
};
