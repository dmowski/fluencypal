import dayjs from 'dayjs';
import { fullEnglishLanguageName } from '@/features/Lang/lang';
import { fluencyCallLanguageCode } from './callLanguage';
import { CallClockLabel, CallCountdown, FluencyCall } from './types';

const SECOND_MS = 1000;
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

export function getCallCountdown(startsAtIso: string, now: Date): CallCountdown | null {
  const startMs = new Date(startsAtIso).getTime();
  if (Number.isNaN(startMs)) return null;

  const diff = startMs - now.getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true };
  }

  const days = Math.floor(diff / DAY_MS);
  const hours = Math.floor((diff % DAY_MS) / HOUR_MS);
  const minutes = Math.floor((diff % HOUR_MS) / MINUTE_MS);
  const seconds = Math.floor((diff % MINUTE_MS) / SECOND_MS);

  return { days, hours, minutes, seconds, isLive: false };
}

/** Scheduled calls that started longer ago than this stay off the card. */
export const FLUENCY_CALL_LIST_LOOKBACK_MS = 12 * 60 * 60 * 1000;

/** Scheduled calls that are upcoming, or that started within the lookback window. */
export function selectListedCalls(calls: FluencyCall[], now: Date): FluencyCall[] {
  const cutoff = now.getTime() - FLUENCY_CALL_LIST_LOOKBACK_MS;
  return calls
    .filter((call) => call.status === 'scheduled')
    .filter((call) => {
      const start = new Date(call.startsAtIso).getTime();
      return Number.isFinite(start) && start >= cutoff;
    })
    .sort((a, b) => a.startsAtIso.localeCompare(b.startsAtIso));
}

export function selectVisibleCall(calls: FluencyCall[], now: Date): FluencyCall | null {
  const open = calls.filter((call) => call.status === 'scheduled');
  if (open.length === 0) return null;

  const nowMs = now.getTime();
  const sorted = [...open].sort((a, b) => a.startsAtIso.localeCompare(b.startsAtIso));
  const live = sorted.filter((call) => new Date(call.startsAtIso).getTime() <= nowMs);
  if (live.length > 0) {
    return live[live.length - 1];
  }
  return sorted[0];
}

const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/;
const WARSAW_TIME_ZONE = 'Europe/Warsaw';

export function formatCallStartLabel(iso: string): string {
  const date = dayjs(iso);
  if (!date.isValid()) return '';
  // ISO strings are UTC. dayjs prints them in the viewer's local timezone.
  return date.format('dddd, D MMM, HH:mm');
}

export function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Local calendar fields become a UTC ISO string. Invalid dates are rejected. */
export function fromDatetimeLocalValue(value: string): string | null {
  const match = LOCAL_DATE_TIME.exec(value);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hours = Number(match[4]);
  const minutes = Number(match[5]);
  if (month < 1 || month > 12 || day < 1 || day > 31 || hours > 23 || minutes > 59) {
    return null;
  }

  const local = new Date(year, month - 1, day, hours, minutes, 0, 0);
  if (
    local.getFullYear() !== year ||
    local.getMonth() !== month - 1 ||
    local.getDate() !== day ||
    local.getHours() !== hours ||
    local.getMinutes() !== minutes
  ) {
    return null;
  }

  return local.toISOString();
}

/** Monday-first cells for a month. Empty slots are leading days from the previous week. */
export function buildMonthGrid(year: number, monthIndex: number): Array<number | null> {
  const firstWeekday = new Date(year, monthIndex, 1).getDay();
  const leading = (firstWeekday + 6) % 7;
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const cells: Array<number | null> = Array.from({ length: leading }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(day);
  }
  return cells;
}

export function localDateKey(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function isLocalDayBefore(date: string, now: Date): boolean {
  return date < localDateKey(now);
}

export function localDateTimeToUtcIso(date: string, time: string): string | null {
  if (!date || !time) return null;
  return fromDatetimeLocalValue(`${date}T${time}`);
}

export function splitLocalDateTime(iso: string): { date: string; time: string } | null {
  const local = toDatetimeLocalValue(iso);
  const [date, time] = local.split('T');
  if (!date || !time) return null;
  return { date, time };
}

export function isUpcomingCallInstant(iso: string, now: Date): boolean {
  const startMs = new Date(iso).getTime();
  if (Number.isNaN(startMs)) return false;
  return startMs >= now.getTime() - 60 * 1000;
}

export function viewerTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/** "America/New_York" becomes "New York". */
export function timeZoneCity(timeZone: string): string {
  const city = timeZone.split('/').pop() || timeZone;
  return city.replace(/_/g, ' ');
}

function zonedPart(
  date: Date,
  type: Intl.DateTimeFormatPartTypes,
  locale: string,
  timeZone: string,
): string {
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  return parts.find((part) => part.type === type)?.value ?? '';
}

/** Short month for the 52px date badge. Vietnamese "Tháng 10" wraps there, so use "T10". */
function badgeMonth(date: Date, locale: string, timeZone: string): string {
  if (locale.toLowerCase().startsWith('vi')) {
    const month = Number(zonedPart(date, 'month', 'en-US', timeZone));
    return `T${month}`;
  }

  return new Intl.DateTimeFormat(locale, { timeZone, month: 'short' })
    .format(date)
    .replace(/\.$/u, '')
    .toUpperCase();
}

function zonedDateKey(date: Date, timeZone: string): string {
  const year = zonedPart(date, 'year', 'en-US', timeZone);
  const month = zonedPart(date, 'month', 'en-US', timeZone);
  const day = zonedPart(date, 'day', 'en-US', timeZone);
  return `${year}-${month}-${day}`;
}

function addCalendarDays(dateKey: string, days: number): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + days));
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${utc.getUTCFullYear()}-${pad(utc.getUTCMonth() + 1)}-${pad(utc.getUTCDate())}`;
}

/** Month badge, day number, and clock time in the given zone. Today and tomorrow stay as codes. */
export function formatCallLabel(
  iso: string,
  now: Date,
  locale = 'en',
  timeZone = viewerTimeZone(),
): CallClockLabel | null {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;

  const safeLocale = locale || 'en';
  const monthShort = badgeMonth(date, safeLocale, timeZone);
  const dayNumeric = String(Number(zonedPart(date, 'day', 'en-US', timeZone)));
  const time = `${zonedPart(date, 'hour', 'en-GB', timeZone)}:${zonedPart(date, 'minute', 'en-GB', timeZone)}`;
  const callKey = zonedDateKey(date, timeZone);
  const todayKey = zonedDateKey(now, timeZone);
  const relative =
    callKey === todayKey
      ? 'today'
      : callKey === addCalendarDays(todayKey, 1)
        ? 'tomorrow'
        : 'weekday';

  return {
    month: monthShort,
    day: dayNumeric,
    time,
    relative,
    weekday: zonedPart(date, 'weekday', safeLocale, timeZone),
  };
}

/** Heading for the language step after someone taps a call time. */
export function communityCallChosenTitle(
  startsAtIso: string,
  now: Date,
  locale: string,
  words: { today: string; tomorrow: string; now: string },
  timeZone = viewerTimeZone(),
): string | null {
  const label = formatCallLabel(startsAtIso, now, locale, timeZone);
  if (!label) return null;
  const live = new Date(startsAtIso).getTime() <= now.getTime();
  return fluencyCallRowTitle(label, live, words);
}

export function fluencyCallRowTitle(
  label: CallClockLabel,
  isLive: boolean,
  words: { today: string; tomorrow: string; now: string },
): string {
  if (isLive) return `${words.now} · ${label.time}`;
  const when =
    label.relative === 'today'
      ? words.today
      : label.relative === 'tomorrow'
        ? words.tomorrow
        : label.weekday;
  return `${when} · ${label.time}`;
}

export function formatWarsawDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  const formatted = new Intl.DateTimeFormat('en-GB', {
    timeZone: WARSAW_TIME_ZONE,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).format(date);
  return `${formatted} (Warsaw)`;
}

export function buildCallRequestTelegramMessage(
  startsAtIso: string,
  languageCode?: string | null,
): string {
  const language = fullEnglishLanguageName[fluencyCallLanguageCode(languageCode)];
  return [
    '📞 FluencyPal call request',
    `Language: ${language}`,
    `Wants to meet: ${formatWarsawDateTime(startsAtIso)}`,
    `UTC: ${startsAtIso}`,
  ].join('\n');
}

export function buildCallJoinTelegramMessage(
  startsAtIso: string,
  languageCode?: string | null,
): string {
  const language = fullEnglishLanguageName[fluencyCallLanguageCode(languageCode)];
  return [
    "🙋 FluencyPal call: I'll join",
    `Language: ${language}`,
    `Call: ${formatWarsawDateTime(startsAtIso)}`,
    `UTC: ${startsAtIso}`,
  ].join('\n');
}

export function suggestedCallSlot(now: Date): { date: string; time: string } {
  const next = new Date(now);
  next.setDate(next.getDate() + 1);
  next.setHours(18, 0, 0, 0);
  const local = toDatetimeLocalValue(next.toISOString());
  const [date, time] = local.split('T');
  return { date, time };
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}
