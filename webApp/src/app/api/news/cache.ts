import { NewsItem, NewsTopic } from '@/features/News/types';
import { getDB } from '../config/firebase';
import { sendTelegramMessageServer } from '../telegram/sendTelegramMessage';
import { getNewsDayKey } from './buildNewsId';

const NEWS_COLLECTION = 'news';

/**
 * Today's window in UTC as ISO timestamps (start inclusive, end exclusive).
 */
const getTodayUtcRange = (): { startIso: string; endIso: string } => {
  const today = getNewsDayKey(new Date().toISOString());
  const start = new Date(`${today}T00:00:00.000Z`);
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { startIso: start.toISOString(), endIso: end.toISOString() };
};

/**
 * Fetch cached news items for the given country/topic published today (UTC).
 */
export const getCachedTodayNews = async ({
  countryCode,
  topic,
}: {
  countryCode: string;
  topic: NewsTopic;
}): Promise<NewsItem[]> => {
  try {
    const db = getDB();
    const { startIso, endIso } = getTodayUtcRange();
    const snapshot = await db
      .collection(NEWS_COLLECTION)
      .where('countryCode', '==', countryCode.trim().toLowerCase())
      .where('topic', '==', topic)
      .where('dateIso', '>=', startIso)
      .where('dateIso', '<', endIso)
      .get();

    return snapshot.docs.map((d) => d.data() as NewsItem);
  } catch (error) {
    sendTelegramMessageServer(`Error reading news cache (today): ${(error as Error).message}`);
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
