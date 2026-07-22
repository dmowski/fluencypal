'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useReaderSettings } from './useReaderSettings';

export type BrowserSpeechPlayCallbacks = {
  onStart?: () => void;
  onEnd?: () => void;
};

type BrowserSpeechApi = {
  isSupported: boolean;
  isPlaying: boolean;
  voices: SpeechSynthesisVoice[];
  language: string;
  selectedVoiceURI: string | null;
  play: (
    text: string,
    voiceURIOverride?: string | null,
    callbacks?: BrowserSpeechPlayCallbacks,
  ) => boolean;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  setLanguage: (nextLanguage: string) => void;
  setSelectedVoiceURI: (voiceURI: string | null) => void;
};

const findMatchingVoice = (language: string, voices: SpeechSynthesisVoice[]) => {
  const normalizedLanguage = language.toLowerCase();

  return voices.find((voice) => {
    const voiceLanguage = voice.lang.toLowerCase();
    return (
      voiceLanguage === normalizedLanguage || voiceLanguage.startsWith(`${normalizedLanguage}-`)
    );
  });
};

export const useBrowserSpeech = (): BrowserSpeechApi => {
  const { language, selectedVoiceURI, setLanguage, setSelectedVoiceURI } = useReaderSettings();

  const isSupported = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return 'speechSynthesis' in window;
  }, []);

  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!isSupported) return;

    const updateVoices = () => {
      const nextVoices = window.speechSynthesis.getVoices();
      setVoices(nextVoices);
    };

    updateVoices();
    window.speechSynthesis.addEventListener('voiceschanged', updateVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', updateVoices);
    };
  }, [isSupported]);

  const stop = useCallback(() => {
    if (!isSupported) return;

    activeUtteranceGenerationRef.current += 1;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  }, [isSupported]);

  const pause = useCallback(() => {
    if (!isSupported) return;

    window.speechSynthesis.pause();
  }, [isSupported]);

  const [isPlaying, setIsPlaying] = useState(false);
  const activeUtteranceGenerationRef = useRef(0);

  const resume = useCallback(() => {
    if (!isSupported) return;

    window.speechSynthesis.resume();
  }, [isSupported]);

  const play = useCallback(
    (text: string, voiceURIOverride?: string | null, callbacks?: BrowserSpeechPlayCallbacks) => {
      if (!isSupported) return false;

      const trimmedText = text.trim();
      if (!trimmedText) return false;

      const utteranceGeneration = activeUtteranceGenerationRef.current + 1;
      activeUtteranceGenerationRef.current = utteranceGeneration;

      const utterance = new SpeechSynthesisUtterance(trimmedText);
      utterance.lang = language;

      const activeVoiceURI = voiceURIOverride ?? selectedVoiceURI;
      const selectedVoice = voices.find((voice) => voice.voiceURI === activeVoiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        const matchingVoice = findMatchingVoice(language, voices);
        if (matchingVoice) {
          utterance.voice = matchingVoice;
        }
      }

      utterance.onstart = () => {
        if (utteranceGeneration !== activeUtteranceGenerationRef.current) return;
        setIsPlaying(true);
        callbacks?.onStart?.();
      };

      // Attach handlers before speak() so they are never missed.
      utterance.onend = () => {
        if (utteranceGeneration !== activeUtteranceGenerationRef.current) return;
        setIsPlaying(false);
        callbacks?.onEnd?.();
      };
      utterance.onerror = () => {
        if (utteranceGeneration !== activeUtteranceGenerationRef.current) return;
        setIsPlaying(false);
      };

      window.speechSynthesis.cancel();
      // Chrome silently pauses remote voices (e.g. "Google US English") after
      // ~15 s of idle. resume() un-stalls the synthesis queue before enqueueing
      // the new utterance so the voice actually plays.
      window.speechSynthesis.resume();
      window.speechSynthesis.speak(utterance);
      return true;
    },
    [isSupported, language, selectedVoiceURI, voices],
  );

  return useMemo(
    () => ({
      isSupported,
      isPlaying,
      voices,
      language,
      selectedVoiceURI,
      play,
      stop,
      pause,
      resume,
      setLanguage,
      setSelectedVoiceURI,
    }),
    [
      isSupported,
      isPlaying,
      voices,
      language,
      selectedVoiceURI,
      play,
      stop,
      pause,
      resume,
      setLanguage,
      setSelectedVoiceURI,
    ],
  );
};
