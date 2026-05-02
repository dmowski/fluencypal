'use client';

import {
  createElement,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { NativeLangCode, ReaderSettings } from '../model/types';

export interface ReaderSettingsApi extends ReaderSettings {
  setLanguage: (nextLanguage: string) => void;
  setSelectedVoiceURI: (nextVoiceURI: string | null) => void;
  setTranslateToLanguage: (nextLanguage: NativeLangCode | null) => void;
  setFontSize: (nextFontSize: number) => void;
  setParagraphGap: (nextParagraphGap: number) => void;
  setLineHeight: (nextLineHeight: number) => void;
  setJustifyText: (nextJustifyText: boolean) => void;
  setTranslateOnHover: (nextTranslateOnHover: boolean) => void;
  setColumns: (nextColumns: 1 | 2) => void;
  setColumnGap: (nextColumnGap: number) => void;
}

const READER_SETTINGS_KEY = 'reader-browser-speech-settings';
const DEFAULT_LANGUAGE = 'en-US';
const DEFAULT_FONT_SIZE = 36;
const DEFAULT_PARAGRAPH_GAP = 20;
const DEFAULT_LINE_HEIGHT = 1.5;
const DEFAULT_JUSTIFY_TEXT = true;
const DEFAULT_TRANSLATE_ON_HOVER = false;
const DEFAULT_COLUMNS: 1 | 2 = 1;
const DEFAULT_COLUMN_GAP = 40;
const MOBILE_INIT_FONT_SIZE = 15;
const MOBILE_INIT_FONT_SIZE_WIDTH_THRESHOLD = 600;
const MOBILE_LAYOUT_WIDTH_THRESHOLD = 1024;
const MOBILE_ORIENTATION_WIDTH_DELTA = 120;

let stableMobileViewportHeight: number | null = null;
let stableMobileViewportWidth: number | null = null;

export const READER_SETTINGS_RANGES = {
  fontSize: { min: 20, max: 64, step: 1 },
  paragraphGap: { min: 0, max: 80, step: 1 },
  lineHeight: { min: 1, max: 2.5, step: 0.05 },
  columnGap: { min: 0, max: 200, step: 1 },
} as const;

const getViewportDimensions = (): { contentWidth: number; contentHeight: number } => {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
  const sidePadding = viewportWidth < 400 ? 20 : 80;
  const rawViewportHeight =
    typeof window !== 'undefined'
      ? (window.document.documentElement?.clientHeight ?? window.innerHeight)
      : 600;

  if (typeof window !== 'undefined') {
    const isMobileLikeViewport =
      viewportWidth <= MOBILE_LAYOUT_WIDTH_THRESHOLD && window.navigator.maxTouchPoints > 0;

    if (!isMobileLikeViewport) {
      stableMobileViewportHeight = null;
      stableMobileViewportWidth = null;
    } else if (stableMobileViewportHeight === null || stableMobileViewportWidth === null) {
      stableMobileViewportHeight = rawViewportHeight;
      stableMobileViewportWidth = viewportWidth;
    } else {
      const widthDelta = Math.abs(viewportWidth - stableMobileViewportWidth);

      if (widthDelta >= MOBILE_ORIENTATION_WIDTH_DELTA) {
        stableMobileViewportHeight = rawViewportHeight;
      } else {
        stableMobileViewportHeight = Math.max(stableMobileViewportHeight, rawViewportHeight);
      }

      stableMobileViewportWidth = viewportWidth;
    }
  }

  return {
    contentWidth: Math.max(0, viewportWidth - sidePadding * 2),
    contentHeight: Math.max(0, stableMobileViewportHeight ?? rawViewportHeight),
  };
};

const ReaderSettingsContext = createContext<ReaderSettingsApi | null>(null);

const getInitialFontSizeByViewportWidth = (viewportWidth: number): number =>
  viewportWidth < MOBILE_INIT_FONT_SIZE_WIDTH_THRESHOLD ? MOBILE_INIT_FONT_SIZE : DEFAULT_FONT_SIZE;

const getInitialSettings = (): ReaderSettings => {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
  const viewportDimensions = getViewportDimensions();
  const initialFontSize = getInitialFontSizeByViewportWidth(viewportWidth);

  if (typeof window === 'undefined') {
    return {
      language: DEFAULT_LANGUAGE,
      selectedVoiceURI: null,
      translateToLanguage: null,
      fontSize: initialFontSize,
      contentWidth: viewportDimensions.contentWidth,
      contentHeight: viewportDimensions.contentHeight,
      paragraphGap: DEFAULT_PARAGRAPH_GAP,
      lineHeight: DEFAULT_LINE_HEIGHT,
      justifyText: DEFAULT_JUSTIFY_TEXT,
      translateOnHover: DEFAULT_TRANSLATE_ON_HOVER,
      columns: DEFAULT_COLUMNS,
      columnGap: DEFAULT_COLUMN_GAP,
    };
  }

  try {
    const rawSettings = window.localStorage.getItem(READER_SETTINGS_KEY);
    if (!rawSettings) {
      return {
        language: window.navigator.language || DEFAULT_LANGUAGE,
        selectedVoiceURI: null,
        translateToLanguage: null,
        fontSize: initialFontSize,
        contentWidth: viewportDimensions.contentWidth,
        contentHeight: viewportDimensions.contentHeight,
        paragraphGap: DEFAULT_PARAGRAPH_GAP,
        lineHeight: DEFAULT_LINE_HEIGHT,
        justifyText: DEFAULT_JUSTIFY_TEXT,
        translateOnHover: DEFAULT_TRANSLATE_ON_HOVER,
        columns: DEFAULT_COLUMNS,
        columnGap: DEFAULT_COLUMN_GAP,
      };
    }

    const parsedSettings = JSON.parse(rawSettings) as Partial<ReaderSettings>;
    const parsedFontSize =
      typeof parsedSettings.fontSize === 'number' ? parsedSettings.fontSize : initialFontSize;
    const parsedContentWidth =
      typeof parsedSettings.contentWidth === 'number'
        ? parsedSettings.contentWidth
        : viewportDimensions.contentWidth;
    const parsedContentHeight =
      typeof parsedSettings.contentHeight === 'number'
        ? parsedSettings.contentHeight
        : viewportDimensions.contentHeight;
    const parsedParagraphGap =
      typeof parsedSettings.paragraphGap === 'number'
        ? parsedSettings.paragraphGap
        : DEFAULT_PARAGRAPH_GAP;
    const parsedLineHeight =
      typeof parsedSettings.lineHeight === 'number'
        ? parsedSettings.lineHeight
        : DEFAULT_LINE_HEIGHT;
    const parsedJustifyText =
      typeof parsedSettings.justifyText === 'boolean'
        ? parsedSettings.justifyText
        : DEFAULT_JUSTIFY_TEXT;
    const parsedTranslateOnHover =
      typeof parsedSettings.translateOnHover === 'boolean'
        ? parsedSettings.translateOnHover
        : DEFAULT_TRANSLATE_ON_HOVER;
    const parsedColumns = parsedSettings.columns === 2 ? 2 : DEFAULT_COLUMNS;
    const parsedColumnGap =
      typeof parsedSettings.columnGap === 'number' ? parsedSettings.columnGap : DEFAULT_COLUMN_GAP;

    return {
      language: parsedSettings.language || window.navigator.language || DEFAULT_LANGUAGE,
      selectedVoiceURI: parsedSettings.selectedVoiceURI || null,
      translateToLanguage: parsedSettings.translateToLanguage || null,
      fontSize: Math.max(
        READER_SETTINGS_RANGES.fontSize.min,
        Math.min(READER_SETTINGS_RANGES.fontSize.max, parsedFontSize),
      ),
      contentWidth: Math.max(0, parsedContentWidth),
      contentHeight: Math.max(0, parsedContentHeight),
      paragraphGap: Math.max(
        READER_SETTINGS_RANGES.paragraphGap.min,
        Math.min(READER_SETTINGS_RANGES.paragraphGap.max, parsedParagraphGap),
      ),
      lineHeight: Math.max(
        READER_SETTINGS_RANGES.lineHeight.min,
        Math.min(READER_SETTINGS_RANGES.lineHeight.max, parsedLineHeight),
      ),
      justifyText: parsedJustifyText,
      translateOnHover: parsedTranslateOnHover,
      columns: parsedColumns,
      columnGap: Math.max(
        READER_SETTINGS_RANGES.columnGap.min,
        Math.min(READER_SETTINGS_RANGES.columnGap.max, parsedColumnGap),
      ),
    };
  } catch {
    return {
      language: window.navigator.language || DEFAULT_LANGUAGE,
      selectedVoiceURI: null,
      translateToLanguage: null,
      fontSize: initialFontSize,
      contentWidth: viewportDimensions.contentWidth,
      contentHeight: viewportDimensions.contentHeight,
      paragraphGap: DEFAULT_PARAGRAPH_GAP,
      lineHeight: DEFAULT_LINE_HEIGHT,
      justifyText: DEFAULT_JUSTIFY_TEXT,
      translateOnHover: DEFAULT_TRANSLATE_ON_HOVER,
      columns: DEFAULT_COLUMNS,
      columnGap: DEFAULT_COLUMN_GAP,
    };
  }
};

const useReaderSettingsState = (): ReaderSettingsApi => {
  const [settings, setSettings] = useState<ReaderSettings>(() => getInitialSettings());

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(READER_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const nextViewportDimensions = getViewportDimensions();
        setSettings((previousSettings) => ({
          ...previousSettings,
          contentWidth: nextViewportDimensions.contentWidth,
          contentHeight: nextViewportDimensions.contentHeight,
        }));
      }, 1000);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const setLanguage = useCallback((nextLanguage: string) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      language: nextLanguage,
      selectedVoiceURI: null,
    }));
  }, []);

  const setSelectedVoiceURI = useCallback((nextVoiceURI: string | null) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      selectedVoiceURI: nextVoiceURI,
    }));
  }, []);

  const setTranslateToLanguage = useCallback((nextLanguage: NativeLangCode | null) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      translateToLanguage: nextLanguage,
    }));
  }, []);

  const setFontSize = useCallback((nextFontSize: number) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      fontSize: Math.max(
        READER_SETTINGS_RANGES.fontSize.min,
        Math.min(READER_SETTINGS_RANGES.fontSize.max, nextFontSize),
      ),
    }));
  }, []);

  const setParagraphGap = useCallback((nextParagraphGap: number) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      paragraphGap: Math.max(
        READER_SETTINGS_RANGES.paragraphGap.min,
        Math.min(READER_SETTINGS_RANGES.paragraphGap.max, nextParagraphGap),
      ),
    }));
  }, []);

  const setLineHeight = useCallback((nextLineHeight: number) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      lineHeight: Math.max(
        READER_SETTINGS_RANGES.lineHeight.min,
        Math.min(READER_SETTINGS_RANGES.lineHeight.max, nextLineHeight),
      ),
    }));
  }, []);

  const setJustifyText = useCallback((nextJustifyText: boolean) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      justifyText: nextJustifyText,
    }));
  }, []);

  const setTranslateOnHover = useCallback((nextTranslateOnHover: boolean) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      translateOnHover: nextTranslateOnHover,
    }));
  }, []);

  const setColumns = useCallback((nextColumns: 1 | 2) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      columns: nextColumns,
    }));
  }, []);

  const setColumnGap = useCallback((nextColumnGap: number) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      columnGap: Math.max(
        READER_SETTINGS_RANGES.columnGap.min,
        Math.min(READER_SETTINGS_RANGES.columnGap.max, nextColumnGap),
      ),
    }));
  }, []);

  return useMemo(
    () => ({
      ...settings,
      setLanguage,
      setSelectedVoiceURI,
      setTranslateToLanguage,
      setFontSize,
      setParagraphGap,
      setLineHeight,
      setJustifyText,
      setTranslateOnHover,
      setColumns,
      setColumnGap,
    }),
    [
      settings,
      setLanguage,
      setSelectedVoiceURI,
      setTranslateToLanguage,
      setFontSize,
      setParagraphGap,
      setLineHeight,
      setJustifyText,
      setTranslateOnHover,
      setColumns,
      setColumnGap,
    ],
  );
};

export const ReaderSettingsProvider = ({ children }: { children: ReactNode }) => {
  const value = useReaderSettingsState();

  return createElement(ReaderSettingsContext.Provider, { value }, children);
};

export const useReaderSettings = (): ReaderSettingsApi => {
  const context = useContext(ReaderSettingsContext);

  if (!context) {
    throw new Error('useReaderSettings must be used within ReaderSettingsProvider');
  }

  return context;
};
