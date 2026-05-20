import { NewsItem } from '@/features/News/types';
import { getDB } from '../config/firebase';
import { sendTelegramMessageServer } from '../telegram/sendTelegramMessage';
import { getNewsDayKey } from './buildNewsId';

const NEWS_COLLECTION = 'news';

/**
 * Fetch cached news items for the given country/language populated today (UTC).
 *
 * The query is keyed on `dayKey` (the UTC day-string we stamp at cache-write
 * time), NOT on the source `publishedAt`. That guarantees today's lookups
 * always find what we populated today, even for articles that the source
 * published late yesterday.
 */
export const getCachedTodayNews = async ({
  countryCode,
  languageCode,
}: {
  countryCode: string;
  languageCode: string;
}): Promise<NewsItem[]> => {
  try {
    const db = getDB();
    const today = getNewsDayKey(new Date().toISOString());
    const snapshot = await db
      .collection(NEWS_COLLECTION)
      .where('countryCode', '==', countryCode.trim().toLowerCase())
      .where('languageCode', '==', languageCode.trim().toLowerCase())
      .where('dayKey', '==', today)
      .get();

    return snapshot.docs.map((d) => d.data() as NewsItem);
  } catch (error) {
    sendTelegramMessageServer(`Error reading news cache (today): ${(error as Error).message}`);
    return [];
  }
};

/**
 * Fetch cached news items for the given country/language populated one day
 * before today (UTC). Returns cached data only — does not trigger any fetch
 * or AI rewrite.
 */
export const getCachedPreviousDayNews = async ({
  countryCode,
  languageCode,
  daysBack = 1,
}: {
  countryCode: string;
  languageCode: string;
  daysBack?: number;
}): Promise<NewsItem[]> => {
  try {
    const db = getDB();
    const target = new Date();
    target.setUTCDate(target.getUTCDate() - daysBack);
    const yesterdayKey = getNewsDayKey(target.toISOString());
    const snapshot = await db
      .collection(NEWS_COLLECTION)
      .where('countryCode', '==', countryCode.trim().toLowerCase())
      .where('languageCode', '==', languageCode.trim().toLowerCase())
      .where('dayKey', '==', yesterdayKey)
      .get();

    return snapshot.docs.map((d) => d.data() as NewsItem);
  } catch (error) {
    sendTelegramMessageServer(
      `Error reading news cache (previous day): ${(error as Error).message}`,
    );
    return [];
  }
};

export const getCachedNewsById = async (id: string): Promise<NewsItem | null> => {
  try {
    const db = getDB();
    const doc = await db.collection(NEWS_COLLECTION).doc(id).get();
    if (!doc.exists) return null;
    return doc.data() as NewsItem;
  } catch (error) {
    sendTelegramMessageServer(
      `Error reading news cache (by id ${id}): ${(error as Error).message}`,
    );
    return null;
  }
};

export const upsertCachedNews = async (item: NewsItem): Promise<void> => {
  try {
    const db = getDB();
    await db.collection(NEWS_COLLECTION).doc(item.id).set(item, { merge: true });
  } catch (error) {
    sendTelegramMessageServer(`Error writing news cache (${item.id}): ${(error as Error).message}`);
  }
};
