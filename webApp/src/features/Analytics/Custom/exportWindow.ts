// Keep in sync with webApp/scripts/analyticsExportWindow.mjs

const DAY_RE = /^\d{4}-\d{2}-\d{2}$/;

export type ExportInstant = {
  kind: 'day' | 'instant';
  dayKey: string;
  iso: string;
};

export type ExportWindow = {
  fromIso: string;
  toIso: string;
  fromDayKey: string;
  toDayKey: string;
  dayKey: string;
};

export const parseExportInstant = (
  value: string | null | undefined,
  flag: string,
): ExportInstant | null => {
  if (!value) return null;
  const raw = String(value).trim();
  if (DAY_RE.test(raw)) {
    const start = new Date(`${raw}T00:00:00.000Z`);
    if (Number.isNaN(start.getTime())) {
      throw new Error(`Invalid ${flag} ${value}. Use YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ.`);
    }
    return { kind: 'day', dayKey: raw, iso: start.toISOString() };
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid ${flag} ${value}. Use YYYY-MM-DD or YYYY-MM-DDTHH:mm:ssZ.`);
  }
  return { kind: 'instant', dayKey: parsed.toISOString().slice(0, 10), iso: parsed.toISOString() };
};

export const resolveExportWindow = ({
  from,
  to,
  day,
  now = new Date(),
}: {
  from?: string | null;
  to?: string | null;
  day?: string | null;
  now?: Date;
}): ExportWindow => {
  const nowIso = now.toISOString();
  const todayKey = nowIso.slice(0, 10);
  const fromParsed = parseExportInstant(from, '--from');
  const toParsed = parseExportInstant(to, '--to');
  const dayParsed = parseExportInstant(day, '--day');

  if (dayParsed && dayParsed.kind !== 'day') {
    throw new Error(`Invalid --day ${day}. Use YYYY-MM-DD.`);
  }

  let startIso: string;
  if (fromParsed) {
    startIso = fromParsed.kind === 'day' ? `${fromParsed.dayKey}T00:00:00.000Z` : fromParsed.iso;
  } else if (dayParsed) {
    startIso = `${dayParsed.dayKey}T00:00:00.000Z`;
  } else {
    startIso = `${todayKey}T00:00:00.000Z`;
  }

  let endIso: string;
  if (toParsed) {
    endIso = toParsed.kind === 'day' ? `${toParsed.dayKey}T23:59:59.999Z` : toParsed.iso;
  } else if (dayParsed) {
    endIso = `${dayParsed.dayKey}T23:59:59.999Z`;
  } else {
    endIso = nowIso;
  }

  if (startIso > endIso) {
    throw new Error(`--from ${startIso} is after window end ${endIso}.`);
  }

  const fromDayKey = startIso.slice(0, 10);
  const toDayKey = endIso.slice(0, 10);
  const dayKey = fromDayKey === toDayKey ? fromDayKey : `${fromDayKey}..${toDayKey}`;

  return { fromIso: startIso, toIso: endIso, fromDayKey, toDayKey, dayKey };
};

const addUtcDays = (dayKey: string, days: number): string => {
  const next = new Date(`${dayKey}T00:00:00.000Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
};

export const nextExportFromLastReport = (
  analyzedThrough: string | null | undefined,
  now = new Date(),
): { from: string | null } => {
  const line = String(analyzedThrough || '').trim();
  if (!line) {
    return { from: null };
  }
  const parsed = parseExportInstant(line, 'Analyzed through');
  if (!parsed) {
    return { from: null };
  }
  if (parsed.kind === 'instant') {
    return { from: parsed.iso };
  }
  const nextDay = addUtcDays(parsed.dayKey, 1);
  const todayKey = now.toISOString().slice(0, 10);
  if (nextDay > todayKey) {
    return { from: `${parsed.dayKey}T00:00:00.000Z` };
  }
  return { from: `${nextDay}T00:00:00.000Z` };
};

export const eventIsInWindow = (
  event: { createdAtIso?: string; createdAtMs?: number; dayKey?: string },
  fromIso: string,
  toIso: string,
  fromDayKey: string,
  toDayKey: string,
): boolean => {
  const eventIso =
    event.createdAtIso || (event.createdAtMs ? new Date(event.createdAtMs).toISOString() : '');
  if (eventIso) {
    return eventIso >= fromIso && eventIso <= toIso;
  }
  const dayKey = event.dayKey || '';
  return Boolean(dayKey) && dayKey >= fromDayKey && dayKey <= toDayKey;
};
