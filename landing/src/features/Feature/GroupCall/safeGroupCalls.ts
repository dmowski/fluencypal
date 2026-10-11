const APP_ORIGIN = process.env.FLUENCY_APP_ORIGIN || 'https://app.fluencypal.com';
const APP_SCHEDULE_URL = `${APP_ORIGIN}/api/fluency-call/schedule`;
const ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/;
const LANGUAGE = /^[a-z]{2}$/;
const MAX_CALLS = 20;

export type SafeGroupCall = {
  id: string;
  startsAtIso: string;
  languageCode: string;
  joinCount: number;
};

/** Keeps only fields the feature page may render. */
export const toSafeGroupCalls = (payload: unknown): SafeGroupCall[] => {
  if (!payload || typeof payload !== 'object' || !('calls' in payload)) return [];
  const calls = payload.calls;
  if (!Array.isArray(calls)) return [];

  const safe: SafeGroupCall[] = [];
  for (const item of calls) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    if (typeof row.startsAtIso !== 'string' || !ISO_UTC.test(row.startsAtIso)) continue;
    if (Number.isNaN(Date.parse(row.startsAtIso))) continue;
    const id =
      typeof row.id === 'string' && row.id.length > 0 && row.id.length <= 128 ? row.id : '';
    if (!id) continue;
    const languageCode =
      typeof row.languageCode === 'string' && LANGUAGE.test(row.languageCode)
        ? row.languageCode
        : 'en';
    const joinCount =
      typeof row.joinCount === 'number' && Number.isFinite(row.joinCount)
        ? Math.max(0, Math.min(500, Math.floor(row.joinCount)))
        : 0;
    safe.push({ id, startsAtIso: row.startsAtIso, languageCode, joinCount });
    if (safe.length >= MAX_CALLS) break;
  }
  return safe;
};

export const fetchGroupConversationSchedule = async (): Promise<SafeGroupCall[]> => {
  const response = await fetch(APP_SCHEDULE_URL, { next: { revalidate: 300 } });
  if (!response.ok) {
    throw new Error(`fluency call schedule failed: ${response.status}`);
  }
  return toSafeGroupCalls(await response.json());
};
