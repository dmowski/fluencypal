import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';

import { firestore } from '@/features/Firebase/init';

import type { NewsItem, NewsItemSummary } from './types';

const NEWS_COLLECTION = 'news';

const getNewsDayKey = (dateIso: string): string => {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid dateIso passed to getNewsDayKey: "${dateIso}"`);
  }
  return date.toISOString().slice(0, 10);
};

const toSummary = (item: NewsItem): NewsItemSummary => ({
  id: item.id,
  title: item.title,
  subTitle: item.subTitle,
  imageUrl: item.imageUrl,
  dateIso: item.dateIso,
  countryCode: item.countryCode,
  languageCode: item.languageCode,
  category: item.category ?? 'general',
  tags: item.tags ?? [],
});

const mapDoc = (data: NewsItem): NewsItem => ({
  ...data,
  category: data.category ?? 'general',
  tags: data.tags ?? [],
});

export const fetchTodayNewsFromFirestore = async ({
  countryCode,
  languageCode,
}: {
  countryCode: string;
  languageCode: string;
}): Promise<NewsItemSummary[]> => {
  const today = getNewsDayKey(new Date().toISOString());
  const snapshot = await getDocs(
    query(
      collection(firestore, NEWS_COLLECTION),
      where('countryCode', '==', countryCode.trim().toLowerCase()),
      where('languageCode', '==', languageCode.trim().toLowerCase()),
      where('dayKey', '==', today),
    ),
  );

  return snapshot.docs
    .map((docSnap) => toSummary(mapDoc(docSnap.data() as NewsItem)))
    .sort((a, b) => b.dateIso.localeCompare(a.dateIso));
};

export const fetchPreviousDayNewsFromFirestore = async ({
  countryCode,
  languageCode,
  daysBack = 1,
}: {
  countryCode: string;
  languageCode: string;
  daysBack?: number;
}): Promise<NewsItemSummary[]> => {
  const target = new Date();
  target.setUTCDate(target.getUTCDate() - daysBack);
  const dayKey = getNewsDayKey(target.toISOString());

  const snapshot = await getDocs(
    query(
      collection(firestore, NEWS_COLLECTION),
      where('countryCode', '==', countryCode.trim().toLowerCase()),
      where('languageCode', '==', languageCode.trim().toLowerCase()),
      where('dayKey', '==', dayKey),
    ),
  );

  return snapshot.docs
    .map((docSnap) => toSummary(mapDoc(docSnap.data() as NewsItem)))
    .sort((a, b) => b.dateIso.localeCompare(a.dateIso));
};

export const fetchNewsByIdFromFirestore = async (id: string): Promise<NewsItem | null> => {
  const docSnap = await getDoc(doc(firestore, NEWS_COLLECTION, id));
  if (!docSnap.exists()) return null;
  return mapDoc(docSnap.data() as NewsItem);
};
