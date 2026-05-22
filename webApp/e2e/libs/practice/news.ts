import { Page } from '@playwright/test';

const FIRESTORE_EMULATOR_HOST = 'http://127.0.0.1:8080';
const FIREBASE_PROJECT_ID = 'dark-lang';

export interface SeedNewsItemInput {
  id: string;
  title: string;
  subTitle?: string;
  titleOrigin?: string;
  subTitleOrigin?: string;
  content_origin?: string;
  imageUrl?: string;
  sourceImageUrl?: string;
  dateIso?: string;
  /** UTC YYYY-MM-DD; defaults to today so the cache-day query matches. */
  dayKey?: string;
  countryCode: string;
  countryName?: string;
  /** Target learning language code; defaults to 'en'. */
  languageCode?: string;
  /** Target learning language display name; defaults to 'English'. */
  languageName?: string;
  sourceUrl?: string;
  versions?: { beginner: string; middle: string; advance: string } | null;
}

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string }
  | { mapValue: { fields: Record<string, FirestoreValue> } }
  | { arrayValue: { values: FirestoreValue[] } };

const toFirestoreValue = (value: unknown): FirestoreValue => {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === 'string') return { stringValue: value };
  if (typeof value === 'boolean') return { booleanValue: value };
  if (typeof value === 'number') {
    return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  }
  if (Array.isArray(value)) {
    return { arrayValue: { values: value.map(toFirestoreValue) } };
  }
  if (typeof value === 'object') {
    const fields: Record<string, FirestoreValue> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      fields[k] = toFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  throw new Error(`Unsupported value type for Firestore: ${typeof value}`);
};

const toFirestoreFields = (obj: Record<string, unknown>): Record<string, FirestoreValue> => {
  const fields: Record<string, FirestoreValue> = {};
  for (const [k, v] of Object.entries(obj)) {
    fields[k] = toFirestoreValue(v);
  }
  return fields;
};

/**
 * Seed a `news/{id}` Firestore document via the emulator REST API using the
 * `Authorization: Bearer owner` backdoor to bypass security rules. Runs from
 * the Node test process (no `page` needed).
 */
export const seedNewsItem = async (input: SeedNewsItemInput): Promise<void> => {
  const nowIso = new Date().toISOString();
  const dayKey = input.dayKey ?? nowIso.slice(0, 10);
  const doc = {
    id: input.id,
    title: input.title,
    subTitle: input.subTitle ?? '',
    titleOrigin: input.titleOrigin ?? input.title,
    subTitleOrigin: input.subTitleOrigin ?? input.subTitle ?? '',
    content_origin: input.content_origin ?? '',
    imageUrl: input.imageUrl ?? '',
    sourceImageUrl: input.sourceImageUrl ?? '',
    dateIso: input.dateIso ?? nowIso,
    dayKey,
    countryCode: input.countryCode.trim().toLowerCase(),
    countryName: input.countryName ?? 'United States',
    languageCode: (input.languageCode ?? 'en').trim().toLowerCase(),
    languageName: input.languageName ?? 'English',
    sourceUrl: input.sourceUrl ?? `https://example.com/${input.id}`,
    versions:
      input.versions === undefined ? { beginner: 'B', middle: 'M', advance: 'A' } : input.versions,
    createdAtIso: nowIso,
  };

  const url =
    `${FIRESTORE_EMULATOR_HOST}/v1/projects/${FIREBASE_PROJECT_ID}` +
    `/databases/(default)/documents/news/${encodeURIComponent(input.id)}`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer owner',
    },
    body: JSON.stringify({ fields: toFirestoreFields(doc) }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to seed news item ${input.id}: ${response.status} ${await response.text()}`,
    );
  }
};

/**
 * Get a Firebase ID token for the currently-signed-in user, fetched from
 * inside the page context via the test handle.
 */
export const getCurrentIdToken = async (page: Page): Promise<string> => {
  return page.evaluate(async () => {
    const handle = (window as any).__darkEngTest;
    if (!handle?.auth?.currentUser) {
      throw new Error('No signed-in user; call signInPracticeWithStepper first');
    }
    return handle.auth.currentUser.getIdToken(true);
  });
};
