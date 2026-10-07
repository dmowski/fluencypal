const part = (parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes) =>
  parts.find((item) => item.type === type)?.value || '';

const titleCase = (value: string) => {
  const trimmed = value.replace(/\.$/u, '').trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toLocaleUpperCase() + trimmed.slice(1).toLocaleLowerCase();
};

export type GroupCallTimeLabel = {
  weekday: string;
  day: string;
  time: string;
  live: boolean;
  when: string;
};

/** Soonest call that has not started. If every call has started, the most recent one. */
export const nextGroupCall = <T extends { startsAtIso: string }>(
  calls: T[],
  nowMs = Date.now(),
): T | null => {
  const upcoming = calls.find((call) => Date.parse(call.startsAtIso) > nowMs);
  if (upcoming) return upcoming;
  return calls.length ? calls[calls.length - 1] : null;
};

export const groupCallTimeLabel = (
  iso: string,
  locale: string,
  timeZone: string,
  nowMs = Date.now(),
): GroupCallTimeLabel => {
  const date = new Date(iso);
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(date);
  const weekday = part(parts, 'weekday').replace(/\.$/u, '').toUpperCase();
  const day = part(parts, 'day');
  const time = `${part(parts, 'hour')}:${part(parts, 'minute')}`;
  return {
    weekday,
    day,
    time,
    live: date.getTime() <= nowMs,
    when: `${titleCase(weekday)} ${time}`,
  };
};
