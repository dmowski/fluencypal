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
  setIsUseMarkdown: (nextIsUseMarkdown: boolean) => void;
  resetToDefault: () => void;
  setFontSize: (nextFontSize: number) => void;
  setParagraphGap: (nextParagraphGap: number) => void;
  setLineHeight: (nextLineHeight: number) => void;
  setJustifyText: (nextJustifyText: boolean) => void;
  setTranslateOnHover: (nextTranslateOnHover: boolean) => void;
}

const READER_SETTINGS_KEY = 'reader-browser-speech-settings';
const DEFAULT_LANGUAGE = 'en-US';
const DEFAULT_IS_USE_MARKDOWN = true;
const DEFAULT_FONT_SIZE = 36;
const DEFAULT_PARAGRAPH_GAP = 20;
const DEFAULT_LINE_HEIGHT = 1.5;
const DEFAULT_JUSTIFY_TEXT = true;
const DEFAULT_TRANSLATE_ON_HOVER = false;
const AUTO_TWO_COLUMNS_MIN_WIDTH = 1200;
const AUTO_TWO_COLUMNS_GAP = 50;
const MOBILE_INIT_FONT_SIZE = 18;
const MOBILE_INIT_FONT_SIZE_WIDTH_THRESHOLD = 600;
const MOBILE_LAYOUT_WIDTH_THRESHOLD = 1024;
const MOBILE_ORIENTATION_WIDTH_DELTA = 120;

let stableMobileViewportHeight: number | null = null;
let stableMobileViewportWidth: number | null = null;

export const READER_SETTINGS_RANGES = {
  fontSize: { min: 9, max: 64, step: 1 },
  paragraphGap: { min: 0, max: 80, step: 1 },
  lineHeight: { min: 1, max: 2.5, step: 0.05 },
} as const;

const getAutoColumnsLayout = (
  contentWidth: number,
): Pick<ReaderSettings, 'columns' | 'columnGap'> => {
  if (contentWidth > AUTO_TWO_COLUMNS_MIN_WIDTH) {
    return { columns: 2, columnGap: AUTO_TWO_COLUMNS_GAP };
  }

  return { columns: 1, columnGap: 0 };
};

const getViewportDimensions = (): { contentWidth: number; contentHeight: number } => {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
  const sidePaddingHorizontal = viewportWidth < 400 ? 20 : 80;
  const sidePaddingVertical = viewportWidth < 400 ? 50 : 30;

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
    contentWidth: Math.max(0, viewportWidth - sidePaddingHorizontal * 2),
    contentHeight: Math.max(
      0,
      (stableMobileViewportHeight ?? rawViewportHeight) - sidePaddingVertical * 2,
    ),
  };
};

const ReaderSettingsContext = createContext<ReaderSettingsApi | null>(null);

const getInitialFontSizeByViewportWidth = (viewportWidth: number): number =>
  viewportWidth < MOBILE_INIT_FONT_SIZE_WIDTH_THRESHOLD ? MOBILE_INIT_FONT_SIZE : DEFAULT_FONT_SIZE;

const getDefaultSettingsFromViewport = (): ReaderSettings => {
  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 800;
  const viewportDimensions = getViewportDimensions();
  const autoColumnsLayout = getAutoColumnsLayout(viewportDimensions.contentWidth);

  return {
    language:
      typeof window !== 'undefined'
        ? window.navigator.language || DEFAULT_LANGUAGE
        : DEFAULT_LANGUAGE,
    selectedVoiceURI: null,
    translateToLanguage: null,
    isUseMarkdown: DEFAULT_IS_USE_MARKDOWN,
    fontSize: getInitialFontSizeByViewportWidth(viewportWidth),
    contentWidth: viewportDimensions.contentWidth,
    contentHeight: viewportDimensions.contentHeight,
    paragraphGap: DEFAULT_PARAGRAPH_GAP,
    lineHeight: DEFAULT_LINE_HEIGHT,
    justifyText: DEFAULT_JUSTIFY_TEXT,
    translateOnHover: DEFAULT_TRANSLATE_ON_HOVER,
    columns: autoColumnsLayout.columns,
    columnGap: autoColumnsLayout.columnGap,
  };
};

const getInitialSettings = (): ReaderSettings => {
  const defaultSettings = getDefaultSettingsFromViewport();

  if (typeof window === 'undefined') {
    return defaultSettings;
  }

  try {
    const rawSettings = window.localStorage.getItem(READER_SETTINGS_KEY);
    if (!rawSettings) {
      return defaultSettings;
    }

    const parsedSettings = JSON.parse(rawSettings) as Partial<ReaderSettings>;
    const parsedFontSize =
      typeof parsedSettings.fontSize === 'number'
        ? parsedSettings.fontSize
        : defaultSettings.fontSize;
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
    const parsedIsUseMarkdown =
      typeof parsedSettings.isUseMarkdown === 'boolean'
        ? parsedSettings.isUseMarkdown
        : DEFAULT_IS_USE_MARKDOWN;
    const parsedTranslateOnHover =
      typeof parsedSettings.translateOnHover === 'boolean'
        ? parsedSettings.translateOnHover
        : DEFAULT_TRANSLATE_ON_HOVER;
    const autoColumnsLayout = getAutoColumnsLayout(defaultSettings.contentWidth);

    return {
      language: parsedSettings.language || window.navigator.language || DEFAULT_LANGUAGE,
      selectedVoiceURI: parsedSettings.selectedVoiceURI || null,
      translateToLanguage: parsedSettings.translateToLanguage || null,
      isUseMarkdown: parsedIsUseMarkdown,
      fontSize: Math.max(
        READER_SETTINGS_RANGES.fontSize.min,
        Math.min(READER_SETTINGS_RANGES.fontSize.max, parsedFontSize),
      ),
      contentWidth: defaultSettings.contentWidth,
      contentHeight: defaultSettings.contentHeight,
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
      columns: autoColumnsLayout.columns,
      columnGap: autoColumnsLayout.columnGap,
    };
  } catch {
    return defaultSettings;
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
        const nextAutoColumnsLayout = getAutoColumnsLayout(nextViewportDimensions.contentWidth);
        setSettings((previousSettings) => ({
          ...previousSettings,
          contentWidth: nextViewportDimensions.contentWidth,
          contentHeight: nextViewportDimensions.contentHeight,
          columns: nextAutoColumnsLayout.columns,
          columnGap: nextAutoColumnsLayout.columnGap,
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

  const setIsUseMarkdown = useCallback((nextIsUseMarkdown: boolean) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      isUseMarkdown: nextIsUseMarkdown,
    }));
  }, []);

  const resetToDefault = useCallback(() => {
    setSettings(getDefaultSettingsFromViewport());
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

  return useMemo(
    () => ({
      ...settings,
      setLanguage,
      setSelectedVoiceURI,
      setTranslateToLanguage,
      setIsUseMarkdown,
      resetToDefault,
      setFontSize,
      setParagraphGap,
      setLineHeight,
      setJustifyText,
      setTranslateOnHover,
    }),
    [
      settings,
      setLanguage,
      setSelectedVoiceURI,
      setTranslateToLanguage,
      setIsUseMarkdown,
      resetToDefault,
      setFontSize,
      setParagraphGap,
      setLineHeight,
      setJustifyText,
      setTranslateOnHover,
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
