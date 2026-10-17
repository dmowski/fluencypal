import { RoomMessage } from '../types';
import { SPEAKING_CLUB_FOUNDER_UID } from '../types';

const AUDIO_TYPES = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/mpeg',
  'audio/wav',
  'audio/m4a',
  'audio/x-m4a',
  'video/webm',
]);

export const isAlexAccount = (user: { uid: string; email?: string | null }): boolean =>
  user.uid === SPEAKING_CLUB_FOUNDER_UID;

export const messageForVisitor = (message: RoomMessage): RoomMessage => ({
  ...message,
  audioPath: '',
  transcript: '',
  correctedTranscript: '',
  likedByMe: false,
});

export const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/** Room pictures are the ones we generate and store. Anything else can track people or break out of CSS. */
export const isAllowedPreviewUrl = (value: string): boolean => {
  if (!value || value.length > 800 || /[\s()"']/.test(value)) return false;
  try {
    const url = new URL(value);
    const local = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const https = url.protocol === 'https:';
    const httpLocal = url.protocol === 'http:' && local;
    if (!https && !httpLocal) return false;
    const hostOk =
      local ||
      url.hostname === 'storage.googleapis.com' ||
      url.hostname === 'firebasestorage.googleapis.com';
    return hostOk && decodeURIComponent(url.pathname).includes('publicImages');
  } catch {
    return false;
  }
};

export const coverImageCss = (value: string): string | undefined =>
  isAllowedPreviewUrl(value) ? `url("${value}")` : undefined;

export const normalizeAudioType = (value: string): string | null => {
  const base = value.split(';')[0]?.trim().toLowerCase() || '';
  if (!base || base === 'application/octet-stream') return 'audio/webm';
  if (!AUDIO_TYPES.has(base)) return null;
  if (base === 'audio/m4a' || base === 'audio/x-m4a') return 'audio/mp4';
  if (base === 'video/webm') return 'audio/webm';
  return base;
};

/**
 * Trust the recorder when it is close to the file size.
 * A long file with a tiny client duration is the bug where stop resets the timer.
 */
export const trustedDurationSec = (clientValue: unknown, byteLength: number): number => {
  const estimated = Math.max(1, Math.min(600, Math.round(byteLength / 6000)));
  const client =
    typeof clientValue === 'number' || typeof clientValue === 'string' ? Number(clientValue) : NaN;
  if (!Number.isFinite(client) || client < 1) return estimated;
  const clamped = Math.min(600, Math.round(client));
  if (estimated > clamped * 3 && estimated >= clamped + 8) return estimated;
  return clamped;
};

export interface SpeakingRateWindow {
  hourKey: string;
  hourMessages: number;
  hourIntros: number;
  dayKey: string;
  dayRooms: number;
}

const HOUR_MESSAGES = 40;
const HOUR_INTROS = 6;
const DAY_ROOMS = 5;

export const bumpSpeakingRate = (
  current: SpeakingRateWindow | null,
  kind: 'message' | 'intro' | 'room',
  now: Date,
): SpeakingRateWindow | 'limited' => {
  const hourKey = now.toISOString().slice(0, 13);
  const dayKey = now.toISOString().slice(0, 10);
  const sameHour = current?.hourKey === hourKey;
  const hourMessages = sameHour ? current.hourMessages : 0;
  const hourIntros = sameHour ? current.hourIntros : 0;
  const dayRooms = current?.dayKey === dayKey ? current.dayRooms : 0;
  if (kind === 'message' && hourMessages >= HOUR_MESSAGES) return 'limited';
  if (kind === 'intro' && hourIntros >= HOUR_INTROS) return 'limited';
  if (kind === 'room' && dayRooms >= DAY_ROOMS) return 'limited';
  return {
    hourKey,
    dayKey,
    hourMessages: hourMessages + (kind === 'message' ? 1 : 0),
    hourIntros: hourIntros + (kind === 'intro' ? 1 : 0),
    dayRooms: dayRooms + (kind === 'room' ? 1 : 0),
  };
};
