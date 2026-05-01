import { useRef, useState } from 'react';
import type { SupportedLanguage } from '../Lang/lang';
import {
  cleanupNativeRealtimeTranscript,
  startNativeRealtimeTranscript,
} from './nativeRealtimeTranscript';
import type {
  BrowserSpeechRecognition,
  StartNativeRealtimeTranscriptParams,
  TranscriptMode,
} from './types';

export const useNativeRealtimeTranscript = () => {
  const [transcript, setTranscript] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activeMode, setActiveMode] = useState<TranscriptMode | null>(null);

  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const stopRequestedRef = useRef(false);

  const cleanup = () => {
    cleanupNativeRealtimeTranscript({ recognitionRef });
    setActiveMode(null);
  };

  const resetTranscriptState = () => {
    setTranscript('');
  };

  const start = async ({ language }: StartNativeRealtimeTranscriptParams = {}) => {
    if (recognitionRef.current) return;

    const nextLanguage: SupportedLanguage = language ?? 'en';

    setIsActive(false);
    setIsActivating(true);
    resetTranscriptState();

    try {
      await startNativeRealtimeTranscript({
        language: nextLanguage,
        refs: {
          recognitionRef,
          stopRequestedRef,
        },
        state: {
          setTranscript,
          setIsActive,
          setIsActivating,
          setActiveMode,
        },
      });
    } catch (error) {
      cleanup();
      setIsActivating(false);
      throw error;
    }
  };

  const stop = () => {
    stopRequestedRef.current = true;
    setIsActive(false);
    setIsActivating(false);
    cleanup();
  };

  const clear = () => {
    setTranscript('');
  };

  return {
    transcript,
    start,
    stop,
    clear,
    isActivating,
    isActive,
    activeMode,
  };
};
