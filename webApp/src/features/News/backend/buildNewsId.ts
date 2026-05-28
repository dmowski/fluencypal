import { getHash } from '@/libs/hash';

/**
 * Day part (YYYY-MM-DD) of an ISO timestamp in UTC. The cache key is keyed by
 * UTC day so the same article published on the same calendar date in UTC
 * always resolves to one document regardless of viewer timezone.
 */
export const getNewsDayKey = (dateIso: string): string => {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid dateIso passed to getNewsDayKey: "${dateIso}"`);
  }
  return date.toISOString().slice(0, 10);
};

/**
 * Deterministic id for a news cache document built from
 * `countryCode + languageCode + day(UTC) + sourceUrl` so the same article is
 * upserted exactly once per country/language/day.
 */
export const buildNewsId = (input: {
  countryCode: string;
  languageCode: string;
  dateIso: string;
  sourceUrl: string;
}): string => {
  const day = getNewsDayKey(input.dateIso);
  const normalizedCountry = input.countryCode.trim().toLowerCase();
  const normalizedLanguage = input.languageCode.trim().toLowerCase();
  const normalizedSource = input.sourceUrl.trim();
  return getHash(`${normalizedCountry}|${normalizedLanguage}|${day}|${normalizedSource}`);
};
