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

type ReaderSettings = {
  language: string;
  selectedVoiceURI: string | null;
  translateToLanguage: NativeLangCode | null;
  fontSize: number;
  paragraphGap: number;
  lineHeight: number;
  contentWidth: number;
  contentHeight: number;
};

type ReaderSettingsApi = {
  language: string;
  selectedVoiceURI: string | null;
  translateToLanguage: NativeLangCode | null;
  fontSize: number;
  paragraphGap: number;
  lineHeight: number;
  contentWidth: number;
  contentHeight: number;
  setLanguage: (nextLanguage: string) => void;
  setSelectedVoiceURI: (nextVoiceURI: string | null) => void;
  setTranslateToLanguage: (nextLanguage: NativeLangCode | null) => void;
  setFontSize: (nextFontSize: number) => void;
  setParagraphGap: (nextParagraphGap: number) => void;
  setLineHeight: (nextLineHeight: number) => void;
  setContentWidth: (nextContentWidth: number) => void;
  setContentHeight: (nextContentHeight: number) => void;
};

const READER_SETTINGS_KEY = 'reader-browser-speech-settings';
const DEFAULT_LANGUAGE = 'en-US';
const DEFAULT_FONT_SIZE = 36;
const DEFAULT_PARAGRAPH_GAP = 20;
const DEFAULT_LINE_HEIGHT = 1.5;
const DEFAULT_CONTENT_WIDTH = 1200;
const DEFAULT_CONTENT_HEIGHT = 500;
const ReaderSettingsContext = createContext<ReaderSettingsApi | null>(null);

const getInitialSettings = (): ReaderSettings => {
  if (typeof window === 'undefined') {
    return {
      language: DEFAULT_LANGUAGE,
      selectedVoiceURI: null,
      translateToLanguage: null,
      fontSize: DEFAULT_FONT_SIZE,
      paragraphGap: DEFAULT_PARAGRAPH_GAP,
      lineHeight: DEFAULT_LINE_HEIGHT,
      contentWidth: DEFAULT_CONTENT_WIDTH,
      contentHeight: DEFAULT_CONTENT_HEIGHT,
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
        contentWidth: DEFAULT_CONTENT_WIDTH,
        contentHeight: DEFAULT_CONTENT_HEIGHT,
      };
    }

    const parsedSettings = JSON.parse(rawSettings) as Partial<ReaderSettings>;
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
    const parsedContentWidth =
      typeof parsedSettings.contentWidth === 'number'
        ? parsedSettings.contentWidth
        : DEFAULT_CONTENT_WIDTH;
    const parsedContentHeight =
      typeof parsedSettings.contentHeight === 'number'
        ? parsedSettings.contentHeight
        : DEFAULT_CONTENT_HEIGHT;

    return {
      language: parsedSettings.language || window.navigator.language || DEFAULT_LANGUAGE,
      selectedVoiceURI: parsedSettings.selectedVoiceURI || null,
      translateToLanguage: parsedSettings.translateToLanguage || null,
      fontSize: Math.max(20, Math.min(64, parsedFontSize)),
      paragraphGap: Math.max(0, Math.min(80, parsedParagraphGap)),
      lineHeight: Math.max(1, Math.min(2.5, parsedLineHeight)),
      contentWidth: Math.max(600, Math.min(1600, parsedContentWidth)),
      contentHeight: Math.max(300, Math.min(1200, parsedContentHeight)),
    };
  } catch {
    return {
      language: window.navigator.language || DEFAULT_LANGUAGE,
      selectedVoiceURI: null,
      translateToLanguage: null,
      fontSize: DEFAULT_FONT_SIZE,
      paragraphGap: DEFAULT_PARAGRAPH_GAP,
      lineHeight: DEFAULT_LINE_HEIGHT,
      contentWidth: DEFAULT_CONTENT_WIDTH,
      contentHeight: DEFAULT_CONTENT_HEIGHT,
    };
  }
};

const useReaderSettingsState = (): ReaderSettingsApi => {
  const [settings, setSettings] = useState<ReaderSettings>(() => getInitialSettings());

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
      fontSize: Math.max(20, Math.min(64, nextFontSize)),
    }));
  }, []);

  const setParagraphGap = useCallback((nextParagraphGap: number) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      paragraphGap: Math.max(0, Math.min(80, nextParagraphGap)),
    }));
  }, []);

  const setLineHeight = useCallback((nextLineHeight: number) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      lineHeight: Math.max(1, Math.min(2.5, nextLineHeight)),
    }));
  }, []);

  const setContentWidth = useCallback((nextContentWidth: number) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      contentWidth: Math.max(600, Math.min(1600, nextContentWidth)),
    }));
  }, []);

  const setContentHeight = useCallback((nextContentHeight: number) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      contentHeight: Math.max(300, Math.min(1200, nextContentHeight)),
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
      contentWidth: settings.contentWidth,
      contentHeight: settings.contentHeight,
      setLanguage,
      setSelectedVoiceURI,
      setTranslateToLanguage,
      setFontSize,
      setParagraphGap,
      setLineHeight,
      setContentWidth,
      setContentHeight,
    }),
    [
      settings.language,
      settings.selectedVoiceURI,
      settings.translateToLanguage,
      settings.fontSize,
      settings.paragraphGap,
      settings.lineHeight,
      settings.contentWidth,
      settings.contentHeight,
      setLanguage,
      setSelectedVoiceURI,
      setTranslateToLanguage,
      setFontSize,
      setParagraphGap,
      setLineHeight,
      setContentWidth,
      setContentHeight,
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
