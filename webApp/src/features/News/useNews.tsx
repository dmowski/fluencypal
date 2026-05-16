'use client';

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getNewsByIdRequest } from '@/app/api/news/getNewsById/getNewsByIdRequest';
import { getTodayNewsRequest } from '@/app/api/news/getTodayNews/getTodayNewsRequest';

import { useAuth } from '../Auth/useAuth';
import { useSettings } from '../Settings/useSettings';

import {
  DEFAULT_NEWS_COMPLEXITY,
  DEFAULT_NEWS_TOPIC,
  NEWS_COUNTRY_NAME_BY_CODE,
  NEWS_SUPPORTED_COUNTRIES,
} from './constants';
import type { NewsItem, NewsItemSummary, NewsLanguageComplexity, NewsTopic } from './types';

const STORAGE_KEY = 'news.settings.v1';

interface PersistedSettings {
  complexity: NewsLanguageComplexity;
  topic: NewsTopic;
  /**
   * gNews-supported alpha-2 country code that overrides the account
   * `userSettings.country` for news fetches only. `null` / missing means
   * "use the account country". Stored alongside other news prefs so a single
   * read/write keeps them in sync.
   */
  countryOverride?: string | null;
}

const readPersistedSettings = (): Partial<PersistedSettings> => {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Partial<PersistedSettings>;
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
};

const writePersistedSettings = (settings: PersistedSettings): void => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore quota / disabled storage.
  }
};

export interface NewsContextValue {
  items: NewsItemSummary[] | null;
  isLoading: boolean;
  error: string | null;
  complexity: NewsLanguageComplexity;
  topic: NewsTopic;
  /**
   * Effective alpha-2 country code used for news fetches: the override when
   * set, otherwise the account country. `null` while we have nothing to fetch
   * with.
   */
  country: string | null;
  /** Display name for the effective country (used as the card badge). */
  countryName: string;
  /**
   * User-chosen override, or `null` when News should follow the account
   * country.
   */
  countryOverride: string | null;
  selectedNewsId: string | null;
  setComplexity: (next: NewsLanguageComplexity) => void;
  setTopic: (next: NewsTopic) => void;
  setCountryOverride: (next: string | null) => void;
  openNews: (id: string) => void;
  closeNews: () => void;
  getNewsById: (id: string) => Promise<NewsItem | null>;
  refresh: () => Promise<void>;
}

const noopAsync = async () => undefined;
const noopGetById = async () => null;

const NewsContext = createContext<NewsContextValue>({
  items: null,
  isLoading: false,
  error: null,
  complexity: DEFAULT_NEWS_COMPLEXITY,
  topic: DEFAULT_NEWS_TOPIC,
  country: null,
  countryName: '',
  countryOverride: null,
  selectedNewsId: null,
  setComplexity: () => undefined,
  setTopic: () => undefined,
  setCountryOverride: () => undefined,
  openNews: () => undefined,
  closeNews: () => undefined,
  getNewsById: noopGetById,
  refresh: noopAsync,
});

interface NewsProviderProps {
  children: ReactNode;
}

export const NewsProvider = ({ children }: NewsProviderProps) => {
  const settings = useSettings();
  const auth = useAuth();

  const persisted = useRef<Partial<PersistedSettings> | null>(null);
  if (persisted.current === null) {
    persisted.current = readPersistedSettings();
  }

  const [complexity, setComplexityState] = useState<NewsLanguageComplexity>(
    persisted.current.complexity ?? DEFAULT_NEWS_COMPLEXITY,
  );
  const [topic, setTopicState] = useState<NewsTopic>(persisted.current.topic ?? DEFAULT_NEWS_TOPIC);

  // Validate persisted override against the current supported-countries list
  // so removing a country from gNews does not strand the user on a code that
  // returns zero results forever.
  const initialOverride =
    persisted.current.countryOverride &&
    NEWS_SUPPORTED_COUNTRIES.some((c) => c.code === persisted.current?.countryOverride)
      ? persisted.current.countryOverride
      : null;
  const [countryOverride, setCountryOverrideState] = useState<string | null>(initialOverride);

  const [items, setItems] = useState<NewsItemSummary[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null);

  const inFlightKey = useRef<string | null>(null);
  const byIdCache = useRef<Map<string, NewsItem>>(new Map());

  const accountCountry = settings.userSettings?.country ?? null;
  const accountCountryName = settings.userSettings?.countryName ?? '';

  // Effective values: override wins when set; otherwise fall back to the
  // account country. When overriding we resolve the display name from the
  // supported-countries table so the dashboard badge stays consistent.
  const country = countryOverride ?? accountCountry;
  const countryName = countryOverride
    ? (NEWS_COUNTRY_NAME_BY_CODE[countryOverride] ?? '')
    : accountCountryName;

  const fetchToday = useCallback(
    async (key: string, countryCode: string, countryNameValue: string, topicValue: NewsTopic) => {
      if (inFlightKey.current === key) return;
      inFlightKey.current = key;
      setIsLoading(true);
      setError(null);
      try {
        const token = await auth.getToken();
        const response = await getTodayNewsRequest(
          { countryCode, countryName: countryNameValue, topic: topicValue },
          token || null,
        );
        // Guard against late responses overwriting newer state.
        if (inFlightKey.current === key) {
          setItems(response.items);
        }
      } catch (e) {
        if (inFlightKey.current === key) {
          setError(e instanceof Error ? e.message : 'Failed to load news');
          setItems([]);
        }
      } finally {
        if (inFlightKey.current === key) {
          setIsLoading(false);
        }
      }
    },
    [auth],
  );

  // Minimal effect: synchronize with the external news endpoint. Guarded by
  // `inFlightKey` so React 18 strict-mode double-mount fires the request once.
  useEffect(() => {
    if (!country) return;
    const key = `${country}|${topic}`;
    if (inFlightKey.current === key) return;
    void fetchToday(key, country, countryName, topic);
  }, [country, countryName, topic, fetchToday]);

  // Keep refs in sync so the setters below can persist all fields without
  // re-creating themselves on every render.
  const topicRef = useRef(topic);
  const complexityRef = useRef(complexity);
  const countryOverrideRef = useRef(countryOverride);
  topicRef.current = topic;
  complexityRef.current = complexity;
  countryOverrideRef.current = countryOverride;

  const setComplexity = useCallback((next: NewsLanguageComplexity) => {
    setComplexityState(next);
    writePersistedSettings({
      complexity: next,
      topic: topicRef.current,
      countryOverride: countryOverrideRef.current,
    });
  }, []);

  const setTopic = useCallback((next: NewsTopic) => {
    setTopicState(next);
    writePersistedSettings({
      complexity: complexityRef.current,
      topic: next,
      countryOverride: countryOverrideRef.current,
    });
  }, []);

  const setCountryOverride = useCallback((next: string | null) => {
    const normalized = next && NEWS_SUPPORTED_COUNTRIES.some((c) => c.code === next) ? next : null;
    setCountryOverrideState(normalized);
    writePersistedSettings({
      complexity: complexityRef.current,
      topic: topicRef.current,
      countryOverride: normalized,
    });
  }, []);

  const getNewsById = useCallback(
    async (id: string): Promise<NewsItem | null> => {
      const cached = byIdCache.current.get(id);
      if (cached) return cached;
      const token = await auth.getToken();
      const response = await getNewsByIdRequest({ id }, token || null);
      if (response.item) {
        byIdCache.current.set(id, response.item);
      }
      return response.item;
    },
    [auth],
  );

  const refresh = useCallback(async () => {
    if (!country) return;
    const key = `${country}|${topic}|${Date.now()}`;
    await fetchToday(key, country, countryName, topic);
  }, [country, countryName, topic, fetchToday]);

  const openNews = useCallback((id: string) => {
    setSelectedNewsId(id);
  }, []);

  const closeNews = useCallback(() => {
    setSelectedNewsId(null);
  }, []);

  const value = useMemo<NewsContextValue>(
    () => ({
      items,
      isLoading,
      error,
      complexity,
      topic,
      country,
      countryName,
      countryOverride,
      selectedNewsId,
      setComplexity,
      setTopic,
      setCountryOverride,
      openNews,
      closeNews,
      getNewsById,
      refresh,
    }),
    [
      items,
      isLoading,
      error,
      complexity,
      topic,
      country,
      countryName,
      countryOverride,
      selectedNewsId,
      setComplexity,
      setTopic,
      setCountryOverride,
      openNews,
      closeNews,
      getNewsById,
      refresh,
    ],
  );

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
};

export const useNews = (): NewsContextValue => useContext(NewsContext);
