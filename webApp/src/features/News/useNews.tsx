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

import { getTodayNewsRequest } from '@/app/api/news/getTodayNews/getTodayNewsRequest';

import { useAuth } from '../Auth/useAuth';
import { useSettings } from '../Settings/useSettings';
import { fullEnglishLanguageName, type SupportedLanguage } from '../Lang/lang';

import {
  DEFAULT_NEWS_COMPLEXITY,
  NEWS_CATEGORY_ALL,
  NEWS_COUNTRY_NAME_BY_CODE,
  NEWS_SUPPORTED_COUNTRIES,
} from './constants';
import {
  fetchNewsByIdFromFirestore,
  fetchPreviousDayNewsFromFirestore,
  fetchTodayNewsFromFirestore,
} from './newsFirestore';
import type { NewsItem, NewsItemSummary, NewsLanguageComplexity } from './types';

const STORAGE_KEY = 'news.settings.v1';
const FALLBACK_LANGUAGE_CODE: SupportedLanguage = 'en';

interface PersistedSettings {
  complexity: NewsLanguageComplexity;
  /**
   * gNews-supported alpha-2 country code that overrides the account
   * `userSettings.country` for news fetches only. `null` / missing means
   * "use the account country". Stored alongside other news prefs so a single
   * read/write keeps them in sync.
   */
  countryOverride?: string | null;
  /** Category slug filter; `all` shows every category. */
  categoryFilter?: string;
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
  isGenerating: boolean;
  error: string | null;
  complexity: NewsLanguageComplexity;
  categoryFilter: string;
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
  /** Target learning language code currently used for news. */
  languageCode: SupportedLanguage;
  setComplexity: (next: NewsLanguageComplexity) => void;
  setCountryOverride: (next: string | null) => void;
  setCategoryFilter: (next: string) => void;
  getNewsById: (id: string) => Promise<NewsItem | null>;
  refresh: () => Promise<void>;
  previousItems: NewsItemSummary[] | null;
  isPreviousLoading: boolean;
  /** True while there may be more historical days to load. False after a day returns empty. */
  hasMorePrevious: boolean;
  loadPreviousDay: () => Promise<void>;
}

const noopAsync = async () => undefined;
const noopGetById = async () => null;

const NewsContext = createContext<NewsContextValue>({
  items: null,
  isLoading: false,
  isGenerating: false,
  error: null,
  complexity: DEFAULT_NEWS_COMPLEXITY,
  categoryFilter: NEWS_CATEGORY_ALL,
  country: null,
  countryName: '',
  countryOverride: null,
  languageCode: FALLBACK_LANGUAGE_CODE,
  setComplexity: () => undefined,
  setCountryOverride: () => undefined,
  setCategoryFilter: () => undefined,
  getNewsById: noopGetById,
  refresh: noopAsync,
  previousItems: null,
  isPreviousLoading: false,
  hasMorePrevious: true,
  loadPreviousDay: noopAsync,
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

  const initialOverride =
    persisted.current.countryOverride &&
    NEWS_SUPPORTED_COUNTRIES.some((c) => c.code === persisted.current?.countryOverride)
      ? persisted.current.countryOverride
      : null;
  const [countryOverride, setCountryOverrideState] = useState<string | null>(initialOverride);

  const [categoryFilter, setCategoryFilterState] = useState<string>(
    persisted.current.categoryFilter ?? NEWS_CATEGORY_ALL,
  );

  const [allItems, setAllItems] = useState<NewsItemSummary[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previousItems, setPreviousItems] = useState<NewsItemSummary[] | null>(null);
  const [isPreviousLoading, setIsPreviousLoading] = useState(false);
  const [hasMorePrevious, setHasMorePrevious] = useState(true);
  const dayOffsetRef = useRef(0);

  const inFlightKey = useRef<string | null>(null);
  const byIdCache = useRef<Map<string, NewsItem>>(new Map());

  const accountCountry = settings.userSettings?.country?.toLowerCase() ?? null;
  const accountCountryName = settings.userSettings?.countryName ?? '';

  const isAccountCountrySupported =
    !!accountCountry && NEWS_SUPPORTED_COUNTRIES.some((c) => c.code === accountCountry);
  const defaultCountry = isAccountCountrySupported ? accountCountry : 'us';

  const defaultCountryName = isAccountCountrySupported
    ? accountCountryName
    : (NEWS_COUNTRY_NAME_BY_CODE['us'] ?? 'United States');

  const country = countryOverride ?? defaultCountry;
  const countryName = countryOverride
    ? (NEWS_COUNTRY_NAME_BY_CODE[countryOverride] ?? '')
    : defaultCountryName;

  const languageCode: SupportedLanguage = settings.languageCode ?? FALLBACK_LANGUAGE_CODE;
  const languageName = fullEnglishLanguageName[languageCode];

  const items = useMemo(() => {
    if (!allItems) return null;
    if (categoryFilter === NEWS_CATEGORY_ALL) return allItems;
    return allItems.filter((item) => item.category === categoryFilter);
  }, [allItems, categoryFilter]);

  const readTodayFromFirestore = useCallback(
    async (countryCode: string, languageCodeValue: SupportedLanguage) => {
      return fetchTodayNewsFromFirestore({
        countryCode,
        languageCode: languageCodeValue,
      });
    },
    [],
  );

  const triggerGeneration = useCallback(
    async (
      countryCode: string,
      countryNameValue: string,
      languageCodeValue: SupportedLanguage,
      languageNameValue: string,
    ) => {
      setIsGenerating(true);
      try {
        const token = await auth.getToken();
        const result = await getTodayNewsRequest(
          {
            countryCode,
            countryName: countryNameValue,
            languageCode: languageCodeValue,
            languageName: languageNameValue,
          },
          token || null,
        );
        if (result.items.length > 0) {
          setAllItems(result.items);
        }
      } catch {
        // Best-effort; keep showing whatever was loaded initially.
      } finally {
        setIsGenerating(false);
      }
    },
    [auth],
  );

  const fetchToday = useCallback(
    async (
      key: string,
      countryCode: string,
      countryNameValue: string,
      languageCodeValue: SupportedLanguage,
      languageNameValue: string,
    ) => {
      if (inFlightKey.current === key) return;
      inFlightKey.current = key;
      setAllItems(null);
      setIsLoading(true);
      setError(null);
      try {
        const firestoreItems = await readTodayFromFirestore(countryCode, languageCodeValue);
        if (inFlightKey.current === key) {
          setAllItems(firestoreItems);
        }
      } catch (e) {
        if (inFlightKey.current === key) {
          setError(e instanceof Error ? e.message : 'Failed to load news');
          setAllItems([]);
        }
      } finally {
        if (inFlightKey.current === key) {
          setIsLoading(false);
        }
      }

      void triggerGeneration(countryCode, countryNameValue, languageCodeValue, languageNameValue);
    },
    [readTodayFromFirestore, triggerGeneration],
  );

  const userSettingsLoaded = settings.userSettings !== null;
  useEffect(() => {
    if (!country || !auth.uid || !userSettingsLoaded) return;
    const key = `${country}|${languageCode}`;
    if (inFlightKey.current === key) return;
    dayOffsetRef.current = 0;
    setPreviousItems(null);
    setHasMorePrevious(true);
    void fetchToday(key, country, countryName, languageCode, languageName);
  }, [country, countryName, languageCode, languageName, fetchToday, auth.uid, userSettingsLoaded]);

  const complexityRef = useRef(complexity);
  const countryOverrideRef = useRef(countryOverride);
  const categoryFilterRef = useRef(categoryFilter);
  complexityRef.current = complexity;
  countryOverrideRef.current = countryOverride;
  categoryFilterRef.current = categoryFilter;

  const persistSettings = useCallback((next: Partial<PersistedSettings>) => {
    writePersistedSettings({
      complexity: complexityRef.current,
      countryOverride: countryOverrideRef.current,
      categoryFilter: categoryFilterRef.current,
      ...next,
    });
  }, []);

  const setComplexity = useCallback(
    (next: NewsLanguageComplexity) => {
      setComplexityState(next);
      persistSettings({ complexity: next });
    },
    [persistSettings],
  );

  const setCountryOverride = useCallback(
    (next: string | null) => {
      const normalized =
        next && NEWS_SUPPORTED_COUNTRIES.some((c) => c.code === next) ? next : null;
      setCountryOverrideState(normalized);
      persistSettings({ countryOverride: normalized });
    },
    [persistSettings],
  );

  const setCategoryFilter = useCallback(
    (next: string) => {
      setCategoryFilterState(next);
      persistSettings({ categoryFilter: next });
    },
    [persistSettings],
  );

  const getNewsById = useCallback(async (id: string): Promise<NewsItem | null> => {
    const cached = byIdCache.current.get(id);
    if (cached) return cached;
    const item = await fetchNewsByIdFromFirestore(id);
    if (item) {
      byIdCache.current.set(id, item);
    }
    return item;
  }, []);

  const refresh = useCallback(async () => {
    if (!country) return;
    const key = `${country}|${languageCode}|${Date.now()}`;
    await fetchToday(key, country, countryName, languageCode, languageName);
  }, [country, countryName, languageCode, languageName, fetchToday]);

  const loadPreviousDay = useCallback(async () => {
    if (!country || !languageCode || !hasMorePrevious) return;
    dayOffsetRef.current += 1;
    const daysBack = dayOffsetRef.current;
    setIsPreviousLoading(true);
    try {
      const fetched = await fetchPreviousDayNewsFromFirestore({
        countryCode: country,
        languageCode,
        daysBack,
      });
      const filtered =
        categoryFilter === NEWS_CATEGORY_ALL
          ? fetched
          : fetched.filter((item) => item.category === categoryFilter);
      if (filtered.length === 0) {
        setHasMorePrevious(false);
        setPreviousItems((prev) => prev ?? []);
      } else {
        setPreviousItems((prev) => [...(prev ?? []), ...filtered]);
      }
    } catch {
      setHasMorePrevious(false);
      setPreviousItems((prev) => prev ?? []);
    } finally {
      setIsPreviousLoading(false);
    }
  }, [country, languageCode, hasMorePrevious, categoryFilter]);

  const value = useMemo<NewsContextValue>(
    () => ({
      items,
      isLoading,
      isGenerating,
      error,
      complexity,
      categoryFilter,
      country,
      countryName,
      countryOverride,
      languageCode,
      setComplexity,
      setCountryOverride,
      setCategoryFilter,
      getNewsById,
      refresh,
      previousItems,
      isPreviousLoading,
      hasMorePrevious,
      loadPreviousDay,
    }),
    [
      items,
      isLoading,
      isGenerating,
      error,
      complexity,
      categoryFilter,
      country,
      countryName,
      countryOverride,
      languageCode,
      setComplexity,
      setCountryOverride,
      setCategoryFilter,
      getNewsById,
      refresh,
      previousItems,
      isPreviousLoading,
      hasMorePrevious,
      loadPreviousDay,
    ],
  );

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>;
};

export const useNews = (): NewsContextValue => useContext(NewsContext);
