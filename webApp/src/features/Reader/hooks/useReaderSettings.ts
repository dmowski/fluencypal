'use client';

import {
  createElement,
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { NativeLangCode, ReaderResizeWordAnchor, ReaderSettings } from '../model/types';

export interface ReaderSettingsApi extends ReaderSettings {
  setLanguage: (nextLanguage: string) => void;
  setSelectedVoiceURI: (nextVoiceURI: string | null) => void;
  setTranslateToLanguage: (nextLanguage: NativeLangCode | null) => void;
  resetToDefault: () => void;
  setFontSize: (nextFontSize: number) => void;
  setParagraphGap: (nextParagraphGap: number) => void;
  setLineHeight: (nextLineHeight: number) => void;
  setJustifyText: (nextJustifyText: boolean) => void;
  setTranslateOnHover: (nextTranslateOnHover: boolean) => void;
  setVoiceOverSelectedText: (next: boolean) => void;
  resizeAnchorWord: ReaderResizeWordAnchor | null;
  resizeAnchorHighlightKey: string | null;
  clearResizeAnchorWord: () => void;
}

const READER_SETTINGS_KEY = 'reader-browser-speech-settings';
const DEFAULT_LANGUAGE = 'en-US';
const DEFAULT_FONT_SIZE = 36;
const DEFAULT_PARAGRAPH_GAP = 20;
const DEFAULT_LINE_HEIGHT = 1.5;
const DEFAULT_JUSTIFY_TEXT = false;
const DEFAULT_TRANSLATE_ON_HOVER = false;
const DEFAULT_VOICE_OVER_SELECTED_TEXT = false;
const AUTO_TWO_COLUMNS_MIN_WIDTH = 1200;
const AUTO_TWO_COLUMNS_GAP = 50;
const MOBILE_INIT_FONT_SIZE = 18;
const MOBILE_INIT_FONT_SIZE_WIDTH_THRESHOLD = 600;
const MOBILE_LAYOUT_WIDTH_THRESHOLD = 1024;
const MOBILE_ORIENTATION_WIDTH_DELTA = 120;
const RESIZE_RECALC_DEBOUNCE_MS = 1000;
const RESIZE_HIGHLIGHT_HOLD_MS = 1000;
const READER_CONTENT_SELECTOR = '[data-testid="reader-content"]';
const READER_WORD_ANCHOR_SELECTOR = '[data-reader-word-anchor="true"]';

let stableMobileViewportHeight: number | null = null;
let stableMobileViewportWidth: number | null = null;

type MobileViewportState = {
  stableHeight: number | null;
  stableWidth: number | null;
};

const getStableMobileViewportState = ({
  viewportWidth,
  rawViewportHeight,
  maxTouchPoints,
  previousState,
}: {
  viewportWidth: number;
  rawViewportHeight: number;
  maxTouchPoints: number;
  previousState: MobileViewportState;
}): MobileViewportState => {
  const isMobileLikeViewport = viewportWidth <= MOBILE_LAYOUT_WIDTH_THRESHOLD && maxTouchPoints > 0;

  if (!isMobileLikeViewport) {
    return {
      stableHeight: null,
      stableWidth: null,
    };
  }

  if (previousState.stableHeight === null || previousState.stableWidth === null) {
    return {
      stableHeight: rawViewportHeight,
      stableWidth: viewportWidth,
    };
  }

  const widthDelta = Math.abs(viewportWidth - previousState.stableWidth);

  if (widthDelta >= MOBILE_ORIENTATION_WIDTH_DELTA) {
    return {
      stableHeight: rawViewportHeight,
      stableWidth: viewportWidth,
    };
  }

  // Keep dimensions stable while mobile browser chrome expands/collapses.
  return previousState;
};

export const READER_SETTINGS_RANGES = {
  fontSize: { min: 9, max: 45, step: 1 },
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

  let effectiveViewportWidth = viewportWidth;
  let effectiveViewportHeight = rawViewportHeight;

  if (typeof window !== 'undefined') {
    const nextState = getStableMobileViewportState({
      viewportWidth,
      rawViewportHeight,
      maxTouchPoints: window.navigator.maxTouchPoints,
      previousState: {
        stableHeight: stableMobileViewportHeight,
        stableWidth: stableMobileViewportWidth,
      },
    });

    stableMobileViewportHeight = nextState.stableHeight;
    stableMobileViewportWidth = nextState.stableWidth;

    if (nextState.stableHeight !== null && nextState.stableWidth !== null) {
      effectiveViewportHeight = nextState.stableHeight;
      effectiveViewportWidth = nextState.stableWidth;
    }
  }

  return {
    contentWidth: Math.max(0, effectiveViewportWidth - sidePaddingHorizontal * 2),
    contentHeight: Math.max(0, effectiveViewportHeight - sidePaddingVertical * 2),
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
    fontSize: getInitialFontSizeByViewportWidth(viewportWidth),
    contentWidth: viewportDimensions.contentWidth,
    contentHeight: viewportDimensions.contentHeight,
    paragraphGap: DEFAULT_PARAGRAPH_GAP,
    lineHeight: DEFAULT_LINE_HEIGHT,
    justifyText: DEFAULT_JUSTIFY_TEXT,
    translateOnHover: DEFAULT_TRANSLATE_ON_HOVER,
    voiceOverSelectedText: DEFAULT_VOICE_OVER_SELECTED_TEXT,
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
    const parsedTranslateOnHover =
      typeof parsedSettings.translateOnHover === 'boolean'
        ? parsedSettings.translateOnHover
        : DEFAULT_TRANSLATE_ON_HOVER;
    const parsedVoiceOverSelectedText =
      typeof parsedSettings.voiceOverSelectedText === 'boolean'
        ? parsedSettings.voiceOverSelectedText
        : DEFAULT_VOICE_OVER_SELECTED_TEXT;
    const autoColumnsLayout = getAutoColumnsLayout(defaultSettings.contentWidth);

    return {
      language: parsedSettings.language || window.navigator.language || DEFAULT_LANGUAGE,
      selectedVoiceURI: parsedSettings.selectedVoiceURI || null,
      translateToLanguage: parsedSettings.translateToLanguage || null,
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
      voiceOverSelectedText: parsedVoiceOverSelectedText,
      columns: autoColumnsLayout.columns,
      columnGap: autoColumnsLayout.columnGap,
    };
  } catch {
    return defaultSettings;
  }
};

const captureFirstVisibleWordAnchor = (): ReaderResizeWordAnchor | null => {
  if (typeof document === 'undefined') {
    return null;
  }

  const contentElement = document.querySelector<HTMLElement>(READER_CONTENT_SELECTOR);
  if (!contentElement) {
    return null;
  }

  const contentRect = contentElement.getBoundingClientRect();
  const candidates = Array.from(
    contentElement.querySelectorAll<HTMLElement>(READER_WORD_ANCHOR_SELECTOR),
  );

  for (const element of candidates) {
    const rect = element.getBoundingClientRect();
    const isVisible =
      rect.height > 0 &&
      rect.width > 0 &&
      rect.bottom > contentRect.top + 1 &&
      rect.top < contentRect.bottom - 1;

    if (!isVisible) {
      continue;
    }

    const paragraphIndex = Number(element.dataset.readerAnchorParagraphIndex);
    const wordStartCharOffset = Number(element.dataset.readerAnchorWordStartCharOffset);

    if (!Number.isFinite(paragraphIndex) || !Number.isFinite(wordStartCharOffset)) {
      continue;
    }

    return {
      paragraphIndex,
      wordStartCharOffset,
      key: `${paragraphIndex}-${wordStartCharOffset}`,
    };
  }

  return null;
};

const useReaderSettingsState = (): ReaderSettingsApi => {
  const [settings, setSettings] = useState<ReaderSettings>(() => getInitialSettings());
  const [resizeAnchorWord, setResizeAnchorWord] = useState<ReaderResizeWordAnchor | null>(null);
  const [resizeAnchorHighlightKey, setResizeAnchorHighlightKey] = useState<string | null>(null);
  const isResizeSessionActiveRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(READER_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    let timeoutId: ReturnType<typeof setTimeout>;
    let highlightTimeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      if (!isResizeSessionActiveRef.current) {
        const anchor = captureFirstVisibleWordAnchor();
        setResizeAnchorWord(anchor);
        setResizeAnchorHighlightKey(anchor?.key ?? null);
        isResizeSessionActiveRef.current = true;
      }

      clearTimeout(timeoutId);
      clearTimeout(highlightTimeoutId);

      timeoutId = setTimeout(() => {
        const nextViewportDimensions = getViewportDimensions();
        const nextAutoColumnsLayout = getAutoColumnsLayout(nextViewportDimensions.contentWidth);
        setSettings((previousSettings) => {
          if (
            previousSettings.contentWidth === nextViewportDimensions.contentWidth &&
            previousSettings.contentHeight === nextViewportDimensions.contentHeight &&
            previousSettings.columns === nextAutoColumnsLayout.columns &&
            previousSettings.columnGap === nextAutoColumnsLayout.columnGap
          ) {
            return previousSettings;
          }

          return {
            ...previousSettings,
            contentWidth: nextViewportDimensions.contentWidth,
            contentHeight: nextViewportDimensions.contentHeight,
            columns: nextAutoColumnsLayout.columns,
            columnGap: nextAutoColumnsLayout.columnGap,
          };
        });

        isResizeSessionActiveRef.current = false;
        highlightTimeoutId = setTimeout(() => {
          setResizeAnchorHighlightKey(null);
        }, RESIZE_HIGHLIGHT_HOLD_MS);
      }, RESIZE_RECALC_DEBOUNCE_MS);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
      clearTimeout(highlightTimeoutId);
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

  const setVoiceOverSelectedText = useCallback((next: boolean) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      voiceOverSelectedText: next,
    }));
  }, []);

  const clearResizeAnchorWord = useCallback(() => {
    setResizeAnchorWord(null);
    setResizeAnchorHighlightKey(null);
  }, []);

  return useMemo(
    () => ({
      ...settings,
      setLanguage,
      setSelectedVoiceURI,
      setTranslateToLanguage,
      resetToDefault,
      setFontSize,
      setParagraphGap,
      setLineHeight,
      setJustifyText,
      setTranslateOnHover,
      setVoiceOverSelectedText,
      resizeAnchorWord,
      resizeAnchorHighlightKey,
      clearResizeAnchorWord,
    }),
    [
      settings,
      setLanguage,
      setSelectedVoiceURI,
      setTranslateToLanguage,
      resetToDefault,
      setFontSize,
      setParagraphGap,
      setLineHeight,
      setJustifyText,
      setTranslateOnHover,
      setVoiceOverSelectedText,
      resizeAnchorWord,
      resizeAnchorHighlightKey,
      clearResizeAnchorWord,
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
