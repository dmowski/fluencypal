'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { SupportedLanguage, speechRecognitionLanguages } from '../Lang/lang';

const STORAGE_KEY_PREFIX = 'news-voice-v1';

const readStoredVoiceURI = (languageCode: SupportedLanguage): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(`${STORAGE_KEY_PREFIX}-${languageCode}`);
  } catch {
    return null;
  }
};

const writeStoredVoiceURI = (languageCode: SupportedLanguage, voiceURI: string | null): void => {
  if (typeof window === 'undefined') return;
  try {
    const key = `${STORAGE_KEY_PREFIX}-${languageCode}`;
    if (voiceURI === null) {
      window.localStorage.removeItem(key);
    } else {
      window.localStorage.setItem(key, voiceURI);
    }
  } catch {
    // Ignore quota / disabled storage.
  }
};

const scoreVoiceQuality = (voice: SpeechSynthesisVoice): number => {
  const name = voice.name.toLowerCase();
  // Penalise compact/low-quality voices first.
  if (name.includes('compact')) return 0;
  // Top tier: Google voices — best cross-language quality.
  if (name.includes('google')) return 5;
  // Second tier: other cloud / remote voices.
  if (!voice.localService) return 4;
  // High-quality on-device: macOS Enhanced / Premium, Edge Neural.
  if (name.includes('enhanced') || name.includes('premium')) return 3;
  if (name.includes('neural') || name.includes('natural')) return 3;
  // Default on-device voice.
  return 1;
};

const findBestVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | undefined => {
  if (voices.length === 0) return undefined;
  return [...voices].sort((a, b) => scoreVoiceQuality(b) - scoreVoiceQuality(a))[0];
};

export type NewsVoiceApi = {
  isSupported: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  /** All voices available for the language. Empty when none found. */
  voices: SpeechSynthesisVoice[];
  /** BCP-47 language tag derived from languageCode. */
  bcp47Language: string;
  /** Explicitly stored voice URI; null means "use best available". */
  selectedVoiceURI: string | null;
  /** Resolved voice URI: stored value if available, otherwise best matching voice. */
  effectiveVoiceURI: string | null;
  setSelectedVoiceURI: (voiceURI: string | null) => void;
  play: (text: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
};

export const useNewsVoice = (languageCode: SupportedLanguage): NewsVoiceApi => {
  const bcp47Language = speechRecognitionLanguages[languageCode];

  const isSupported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }, []);

  const [allVoices, setAllVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedVoiceURI, setSelectedVoiceURIState] = useState<string | null>(() =>
    readStoredVoiceURI(languageCode),
  );

  // Reset stored voice when language changes.
  useEffect(() => {
    setSelectedVoiceURIState(readStoredVoiceURI(languageCode));
  }, [languageCode]);

  useEffect(() => {
    if (!isSupported) return;

    const updateVoices = () => {
      setAllVoices(window.speechSynthesis.getVoices());
    };

    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    };
  }, [isSupported]);

  useEffect(() => {
    if (!isSupported) return;
    return () => {
      window.speechSynthesis.cancel();
    };
  }, [isSupported]);

  const voices = useMemo(() => {
    const normalized = bcp47Language.toLowerCase();
    const langPrefix = normalized.split('-')[0];
    return allVoices.filter((v) => {
      const vLang = v.lang.toLowerCase();
      return vLang === normalized || vLang.startsWith(`${langPrefix}-`);
    });
  }, [allVoices, bcp47Language]);

  const effectiveVoiceURI = useMemo(() => {
    const storedIsAvailable = voices.some((v) => v.voiceURI === selectedVoiceURI);
    if (storedIsAvailable) return selectedVoiceURI;
    return findBestVoice(voices)?.voiceURI ?? voices[0]?.voiceURI ?? null;
  }, [voices, selectedVoiceURI, bcp47Language]);

  const setSelectedVoiceURI = useCallback(
    (voiceURI: string | null) => {
      setSelectedVoiceURIState(voiceURI);
      writeStoredVoiceURI(languageCode, voiceURI);
    },
    [languageCode],
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  }, [isSupported]);

  const resume = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.resume();
    setIsPlaying(true);
    setIsPaused(false);
  }, [isSupported]);

  const play = useCallback(
    (text: string) => {
      if (!isSupported) return;
      const trimmed = text.trim();
      if (!trimmed) return;

      const utterance = new SpeechSynthesisUtterance(trimmed);
      utterance.lang = bcp47Language;

      const voiceToUse = allVoices.find((v) => v.voiceURI === effectiveVoiceURI);
      if (voiceToUse) {
        utterance.voice = voiceToUse;
      }

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        setIsPaused(false);
      };

      window.speechSynthesis.cancel();
      window.speechSynthesis.resume();
      setIsPlaying(true);
      setIsPaused(false);
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, bcp47Language, allVoices, effectiveVoiceURI],
  );

  return {
    isSupported,
    isPlaying,
    isPaused,
    voices,
    bcp47Language,
    selectedVoiceURI,
    effectiveVoiceURI,
    setSelectedVoiceURI,
    play,
    pause,
    resume,
    stop,
  };
};
