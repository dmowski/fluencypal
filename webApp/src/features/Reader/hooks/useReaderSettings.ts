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
import { NativeLangCode } from '@/libs/language/type';
import { ReaderUiSettings } from '../model/types';

export interface ReaderSettings extends ReaderUiSettings {
  language: string;
  selectedVoiceURI: string | null;
  translateToLanguage: NativeLangCode | null;
  setLanguage: (nextLanguage: string) => void;
  setSelectedVoiceURI: (nextVoiceURI: string | null) => void;
  setTranslateToLanguage: (nextLanguage: NativeLangCode | null) => void;
  setFontSize: (nextFontSize: number) => void;
  setParagraphGap: (nextParagraphGap: number) => void;
  setLineHeight: (nextLineHeight: number) => void;
  setJustifyText: (nextJustifyText: boolean) => void;
  setContentWidth: (nextContentWidth: number) => void;
  setContentHeight: (nextContentHeight: number) => void;
  setColumns: (nextColumns: 1 | 2) => void;
  setColumnGap: (nextColumnGap: number) => void;
}

type PersistedReaderSettings = Pick<
  ReaderSettings,
  keyof ReaderUiSettings | 'language' | 'selectedVoiceURI' | 'translateToLanguage'
>;

const READER_SETTINGS_KEY = 'reader-browser-speech-settings';
const DEFAULT_LANGUAGE = 'en-US';
const DEFAULT_FONT_SIZE = 36;
const DEFAULT_PARAGRAPH_GAP = 20;
const DEFAULT_LINE_HEIGHT = 1.5;
const DEFAULT_JUSTIFY_TEXT = true;
const DEFAULT_CONTENT_WIDTH = 1200;
const DEFAULT_CONTENT_HEIGHT = 500;
const DEFAULT_COLUMNS: 1 | 2 = 1;
const DEFAULT_COLUMN_GAP = 40;

export const READER_SETTINGS_RANGES = {
  fontSize: { min: 20, max: 64, step: 1 },
  paragraphGap: { min: 0, max: 80, step: 1 },
  lineHeight: { min: 1, max: 2.5, step: 0.05 },
  contentWidth: { min: 600, max: 3000, step: 10 },
  contentHeight: { min: 300, max: 2000, step: 10 },
  columnGap: { min: 0, max: 200, step: 1 },
} as const;
const ReaderSettingsContext = createContext<ReaderSettings | null>(null);

const getInitialSettings = (): PersistedReaderSettings => {
  if (typeof window === 'undefined') {
    return {
      language: DEFAULT_LANGUAGE,
      selectedVoiceURI: null,
      translateToLanguage: null,
      fontSize: DEFAULT_FONT_SIZE,
      paragraphGap: DEFAULT_PARAGRAPH_GAP,
      lineHeight: DEFAULT_LINE_HEIGHT,
      justifyText: DEFAULT_JUSTIFY_TEXT,
      contentWidth: DEFAULT_CONTENT_WIDTH,
      contentHeight: DEFAULT_CONTENT_HEIGHT,
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
        fontSize: DEFAULT_FONT_SIZE,
        paragraphGap: DEFAULT_PARAGRAPH_GAP,
        lineHeight: DEFAULT_LINE_HEIGHT,
        justifyText: DEFAULT_JUSTIFY_TEXT,
        contentWidth: DEFAULT_CONTENT_WIDTH,
        contentHeight: DEFAULT_CONTENT_HEIGHT,
        columns: DEFAULT_COLUMNS,
        columnGap: DEFAULT_COLUMN_GAP,
      };
    }

    const parsedSettings = JSON.parse(rawSettings) as Partial<PersistedReaderSettings>;
    const parsedFontSize =
      typeof parsedSettings.fontSize === 'number' ? parsedSettings.fontSize : DEFAULT_FONT_SIZE;
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
    const parsedContentWidth =
      typeof parsedSettings.contentWidth === 'number'
        ? parsedSettings.contentWidth
        : DEFAULT_CONTENT_WIDTH;
    const parsedContentHeight =
      typeof parsedSettings.contentHeight === 'number'
        ? parsedSettings.contentHeight
        : DEFAULT_CONTENT_HEIGHT;
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
      paragraphGap: Math.max(
        READER_SETTINGS_RANGES.paragraphGap.min,
        Math.min(READER_SETTINGS_RANGES.paragraphGap.max, parsedParagraphGap),
      ),
      lineHeight: Math.max(
        READER_SETTINGS_RANGES.lineHeight.min,
        Math.min(READER_SETTINGS_RANGES.lineHeight.max, parsedLineHeight),
      ),
      justifyText: parsedJustifyText,
      contentWidth: Math.max(
        READER_SETTINGS_RANGES.contentWidth.min,
        Math.min(READER_SETTINGS_RANGES.contentWidth.max, parsedContentWidth),
      ),
      contentHeight: Math.max(
        READER_SETTINGS_RANGES.contentHeight.min,
        Math.min(READER_SETTINGS_RANGES.contentHeight.max, parsedContentHeight),
      ),
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
      fontSize: DEFAULT_FONT_SIZE,
      paragraphGap: DEFAULT_PARAGRAPH_GAP,
      lineHeight: DEFAULT_LINE_HEIGHT,
      justifyText: DEFAULT_JUSTIFY_TEXT,
      contentWidth: DEFAULT_CONTENT_WIDTH,
      contentHeight: DEFAULT_CONTENT_HEIGHT,
      columns: DEFAULT_COLUMNS,
      columnGap: DEFAULT_COLUMN_GAP,
    };
  }
};

const useReaderSettingsState = (): ReaderSettings => {
  const [settings, setSettings] = useState<PersistedReaderSettings>(() => getInitialSettings());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.localStorage.setItem(READER_SETTINGS_KEY, JSON.stringify(settings));
  }, [settings]);

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

  const setContentWidth = useCallback((nextContentWidth: number) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      contentWidth: Math.max(
        READER_SETTINGS_RANGES.contentWidth.min,
        Math.min(READER_SETTINGS_RANGES.contentWidth.max, nextContentWidth),
      ),
    }));
  }, []);

  const setContentHeight = useCallback((nextContentHeight: number) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      contentHeight: Math.max(
        READER_SETTINGS_RANGES.contentHeight.min,
        Math.min(READER_SETTINGS_RANGES.contentHeight.max, nextContentHeight),
      ),
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
      language: settings.language,
      selectedVoiceURI: settings.selectedVoiceURI,
      translateToLanguage: settings.translateToLanguage,
      fontSize: settings.fontSize,
      paragraphGap: settings.paragraphGap,
      lineHeight: settings.lineHeight,
      justifyText: settings.justifyText,
      contentWidth: settings.contentWidth,
      contentHeight: settings.contentHeight,
      columns: settings.columns,
      columnGap: settings.columnGap,
      setLanguage,
      setSelectedVoiceURI,
      setTranslateToLanguage,
      setFontSize,
      setParagraphGap,
      setLineHeight,
      setJustifyText,
      setContentWidth,
      setContentHeight,
      setColumns,
      setColumnGap,
    }),
    [
      settings.language,
      settings.selectedVoiceURI,
      settings.translateToLanguage,
      settings.fontSize,
      settings.paragraphGap,
      settings.lineHeight,
      settings.justifyText,
      settings.contentWidth,
      settings.contentHeight,
      settings.columns,
      settings.columnGap,
      setLanguage,
      setSelectedVoiceURI,
      setTranslateToLanguage,
      setFontSize,
      setParagraphGap,
      setLineHeight,
      setJustifyText,
      setContentWidth,
      setContentHeight,
      setColumns,
      setColumnGap,
    ],
  );
};

export const ReaderSettingsProvider = ({ children }: { children: ReactNode }) => {
  const value = useReaderSettingsState();

  return createElement(ReaderSettingsContext.Provider, { value }, children);
};

export const useReaderSettings = (): ReaderSettings => {
  const context = useContext(ReaderSettingsContext);

  if (!context) {
    throw new Error('useReaderSettings must be used within ReaderSettingsProvider');
  }

  return context;
};
