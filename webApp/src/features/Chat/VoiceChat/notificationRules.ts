import { RoomNotificationNarrowing, SpeakingNotificationPrefs } from './types';

export const defaultSpeakingNotificationPrefs = (): SpeakingNotificationPrefs => ({
  browserEnabled: false,
  emailEnabled: true,
  inAppEnabled: true,
  sleepStart: '',
  sleepEnd: '',
  timezoneOffsetMinutes: 0,
  newMessages: true,
  reviewJoiners: true,
  newRooms: false,
});

export const defaultRoomNarrowing = (): RoomNotificationNarrowing => ({
  browserEnabled: true,
  emailEnabled: true,
  inAppEnabled: true,
  newMessages: true,
  reviewJoiners: true,
});

const asBool = (value: unknown, fallback: boolean): boolean =>
  typeof value === 'boolean' ? value : fallback;

const asClock = (value: unknown): string => {
  if (typeof value !== 'string') return '';
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(value) ? value : '';
};

export const parseSpeakingNotificationPrefs = (value: unknown): SpeakingNotificationPrefs => {
  const fallback = defaultSpeakingNotificationPrefs();
  if (!value || typeof value !== 'object') return fallback;
  const row = value as Record<string, unknown>;
  return {
    browserEnabled: asBool(row.browserEnabled, fallback.browserEnabled),
    emailEnabled: asBool(row.emailEnabled, fallback.emailEnabled),
    inAppEnabled: asBool(row.inAppEnabled, fallback.inAppEnabled),
    sleepStart: asClock(row.sleepStart),
    sleepEnd: asClock(row.sleepEnd),
    timezoneOffsetMinutes:
      typeof row.timezoneOffsetMinutes === 'number' && Number.isFinite(row.timezoneOffsetMinutes)
        ? Math.max(-14 * 60, Math.min(14 * 60, Math.trunc(row.timezoneOffsetMinutes)))
        : 0,
    newMessages: asBool(row.newMessages, fallback.newMessages),
    reviewJoiners: asBool(row.reviewJoiners, fallback.reviewJoiners),
    newRooms: asBool(row.newRooms, fallback.newRooms),
  };
};

export const parseRoomNarrowing = (value: unknown): RoomNotificationNarrowing => {
  const fallback = defaultRoomNarrowing();
  if (!value || typeof value !== 'object') return fallback;
  const row = value as Record<string, unknown>;
  return {
    browserEnabled: asBool(row.browserEnabled, true),
    emailEnabled: asBool(row.emailEnabled, true),
    inAppEnabled: asBool(row.inAppEnabled, true),
    newMessages: asBool(row.newMessages, true),
    reviewJoiners: asBool(row.reviewJoiners, true),
  };
};

const clockMinutes = (value: string): number | null => {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(value);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

/** Quiet hours use the offset saved with the settings, not the server clock. */
export const isQuietHours = (prefs: SpeakingNotificationPrefs, now = new Date()): boolean => {
  const start = clockMinutes(prefs.sleepStart);
  const end = clockMinutes(prefs.sleepEnd);
  if (start === null || end === null || start === end) return false;
  const shifted = new Date(now.getTime() - prefs.timezoneOffsetMinutes * 60 * 1000);
  const minutes = shifted.getUTCHours() * 60 + shifted.getUTCMinutes();
  if (start < end) return minutes >= start && minutes < end;
  return minutes >= start || minutes < end;
};

export type SpeakingTransport = 'browser' | 'email' | 'inApp';

const transportOn = (prefs: SpeakingNotificationPrefs, transport: SpeakingTransport): boolean => {
  if (transport === 'browser') return prefs.browserEnabled;
  if (transport === 'email') return prefs.emailEnabled;
  return prefs.inAppEnabled;
};

const narrowingOn = (
  narrowing: RoomNotificationNarrowing,
  transport: SpeakingTransport,
): boolean => {
  if (transport === 'browser') return narrowing.browserEnabled;
  if (transport === 'email') return narrowing.emailEnabled;
  return narrowing.inAppEnabled;
};

/**
 * A room setting can only make a global choice quieter.
 * New rooms have no per-room switch.
 */
export const allowsSpeakingNotification = (params: {
  prefs: SpeakingNotificationPrefs;
  narrowing?: RoomNotificationNarrowing | null;
  transport: SpeakingTransport;
  kind: 'newMessages' | 'reviewJoiners' | 'newRooms';
  now?: Date;
}): boolean => {
  const { prefs, narrowing, transport, kind } = params;
  if (kind === 'newRooms') {
    if (!prefs.newRooms) return false;
  } else if (!prefs[kind]) {
    return false;
  } else if (narrowing && !narrowing[kind]) {
    return false;
  }
  if (!transportOn(prefs, transport)) return false;
  if (kind !== 'newRooms' && narrowing && !narrowingOn(narrowing, transport)) return false;
  if ((transport === 'browser' || transport === 'email') && isQuietHours(prefs, params.now)) {
    return false;
  }
  return true;
};
