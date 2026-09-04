import { AiVoice } from '@/features/Ai/ai';

export const PENDING_TEACHER_VOICE_KEY = 'pendingTeacherVoice';

const VOICES: readonly AiVoice[] = ['ash', 'shimmer', 'marin', 'verse'];

export const isAiVoice = (value: string | null): value is AiVoice =>
  Boolean(value && (VOICES as readonly string[]).includes(value));

export const readPendingTeacherVoice = (): AiVoice | null => {
  if (typeof window === 'undefined') return null;
  const stored = window.localStorage.getItem(PENDING_TEACHER_VOICE_KEY);
  return isAiVoice(stored) ? stored : null;
};

export const writePendingTeacherVoice = (voice: AiVoice) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(PENDING_TEACHER_VOICE_KEY, voice);
};

export const clearPendingTeacherVoice = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PENDING_TEACHER_VOICE_KEY);
};
