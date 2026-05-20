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
import { getPreviousDayNewsRequest } from '@/app/api/news/getPreviousDayNews/getPreviousDayNewsRequest';

import { useAuth } from '../Auth/useAuth';
import { useSettings } from '../Settings/useSettings';
import { fullEnglishLanguageName, type SupportedLanguage } from '../Lang/lang';

import {
  DEFAULT_NEWS_COMPLEXITY,
  NEWS_COUNTRY_NAME_BY_CODE,
  NEWS_SUPPORTED_COUNTRIES,
} from './constants';
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
  error: null,
  complexity: DEFAULT_NEWS_COMPLEXITY,
  country: null,
  countryName: '',
  countryOverride: null,
  languageCode: FALLBACK_LANGUAGE_CODE,
  setComplexity: () => undefined,
  setCountryOverride: () => undefined,
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
  const [previousItems, setPreviousItems] = useState<NewsItemSummary[] | null>(null);
  const [isPreviousLoading, setIsPreviousLoading] = useState(false);
  const [hasMorePrevious, setHasMorePrevious] = useState(true);
  const dayOffsetRef = useRef(0);

  const inFlightKey = useRef<string | null>(null);
  const byIdCache = useRef<Map<string, NewsItem>>(new Map());

  const accountCountry = settings.userSettings?.country?.toLowerCase() ?? null;
  const accountCountryName = settings.userSettings?.countryName ?? '';

  // When the account country isn't in the gNews-supported list (or is missing
  // entirely), fall back to the US so the News card still has something
  // sensible to show instead of "No news" or being hidden outright.
  const isAccountCountrySupported =
    !!accountCountry && NEWS_SUPPORTED_COUNTRIES.some((c) => c.code === accountCountry);
  const defaultCountry = isAccountCountrySupported ? accountCountry : 'us';

  const defaultCountryName = isAccountCountrySupported
    ? accountCountryName
    : (NEWS_COUNTRY_NAME_BY_CODE['us'] ?? 'United States');

  // Effective values: override wins when set; otherwise fall back to the
  // (validated) account country or US. When overriding we resolve the display
  // name from the supported-countries table so the dashboard badge stays
  // consistent.
  const country = countryOverride ?? defaultCountry;
  const countryName = countryOverride
    ? (NEWS_COUNTRY_NAME_BY_CODE[countryOverride] ?? '')
    : defaultCountryName;

  // Target learning language drives translation + AI rewrite. Falls back to
  // English when the account hasn't picked one yet (e.g. fresh signup).
  const languageCode: SupportedLanguage = settings.languageCode ?? FALLBACK_LANGUAGE_CODE;
  const languageName = fullEnglishLanguageName[languageCode];

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
      // Clear stale items so the UI shows a loading state instead of leaving
      // the previous country/language results on screen while the new fetch
      // runs in the background.
      setItems(null);
      setIsLoading(true);
      setError(null);
      try {
        const token = await auth.getToken();
        const response = await getTodayNewsRequest(
          {
            countryCode,
            countryName: countryNameValue,
            languageCode: languageCodeValue,
            languageName: languageNameValue,
          },
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
  // We wait until the user settings document has finished loading so we don't
  // briefly fetch with the US fallback and then immediately re-fetch with the
  // real account country once Firestore resolves.
  const userSettingsLoaded = settings.userSettings !== null;
  useEffect(() => {
    if (!country || !auth.uid || !userSettingsLoaded) return;
    const key = `${country}|${languageCode}`;
    if (inFlightKey.current === key) return;
    void fetchToday(key, country, countryName, languageCode, languageName);
  }, [country, countryName, languageCode, languageName, fetchToday, auth.uid, userSettingsLoaded]);

  // Keep refs in sync so the setters below can persist all fields without
  // re-creating themselves on every render.
  const complexityRef = useRef(complexity);
  const countryOverrideRef = useRef(countryOverride);
  complexityRef.current = complexity;
  countryOverrideRef.current = countryOverride;

  const setComplexity = useCallback((next: NewsLanguageComplexity) => {
    setComplexityState(next);
    writePersistedSettings({
      complexity: next,
      countryOverride: countryOverrideRef.current,
    });
  }, []);

  const setCountryOverride = useCallback((next: string | null) => {
    const normalized = next && NEWS_SUPPORTED_COUNTRIES.some((c) => c.code === next) ? next : null;
    setCountryOverrideState(normalized);
    writePersistedSettings({
      complexity: complexityRef.current,
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
    const key = `${country}|${languageCode}|${Date.now()}`;
    await fetchToday(key, country, countryName, languageCode, languageName);
  }, [country, countryName, languageCode, languageName, fetchToday]);

  const loadPreviousDay = useCallback(async () => {
    if (!country || !languageCode || !hasMorePrevious) return;
    dayOffsetRef.current += 1;
    const daysBack = dayOffsetRef.current;
    setIsPreviousLoading(true);
    try {
      const token = await auth.getToken();
      const response = await getPreviousDayNewsRequest(
        { countryCode: country, languageCode, daysBack },
        token || null,
      );
      if (response.items.length === 0) {
        setHasMorePrevious(false);
        // Still mark previousItems as initialized so the section renders.
        setPreviousItems((prev) => prev ?? []);
      } else {
        setPreviousItems((prev) => [...(prev ?? []), ...response.items]);
      }
    } catch {
      setHasMorePrevious(false);
      setPreviousItems((prev) => prev ?? []);
    } finally {
      setIsPreviousLoading(false);
    }
  }, [country, languageCode, auth, hasMorePrevious]);

  const value = useMemo<NewsContextValue>(
    () => ({
      items,
      isLoading,
      error,
      complexity,
      country,
      countryName,
      countryOverride,
      languageCode,
      setComplexity,
      setCountryOverride,
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
      error,
      complexity,
      country,
      countryName,
      countryOverride,
      languageCode,
      setComplexity,
      setCountryOverride,
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
