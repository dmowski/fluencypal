import { useRef, useState } from 'react';
import type { SupportedLanguage } from '../Lang/lang';
import { useSettings } from '../Settings/useSettings';
import { useAuth } from '../Auth/useAuth';
import {
  cleanupNativeRealtimeTranscript,
  startNativeRealtimeTranscript,
} from './nativeRealtimeTranscript';
import {
  cleanupOpenAiRealtimeTranscript,
  startOpenAiRealtimeTranscript,
} from './openAiRealtimeTranscript';
import type {
  BrowserSpeechRecognition,
  StartRealtimeTranscriptParams,
  TranscriptMode,
} from './types';

export const useRealtimeTranscript = () => {
  const [completedTranscripts, setCompletedTranscripts] = useState<string[]>([]);
  const [partialTranscriptMap, setPartialTranscriptMap] = useState<Record<string, string>>({});
  const [isActive, setIsActive] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activeMode, setActiveMode] = useState<TranscriptMode | null>(null);

  const settings = useSettings();
  const auth = useAuth();

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const stopRequestedRef = useRef(false);

  const partialTranscript = Object.values(partialTranscriptMap).join(' ');

  const cleanup = () => {
    cleanupNativeRealtimeTranscript({ recognitionRef, setPartialTranscriptMap });
    cleanupOpenAiRealtimeTranscript({
      pcRef,
      dcRef,
      recognitionRef,
      stopRequestedRef,
    });
    setActiveMode(null);
  };

  const resetTranscriptState = () => {
    setCompletedTranscripts([]);
    setPartialTranscriptMap({});
  };

  const startAiTranscript = async (language: SupportedLanguage) => {
    await startOpenAiRealtimeTranscript({
      language,
      getAuthToken: () => auth.getToken(),
      refs: {
        pcRef,
        dcRef,
        recognitionRef,
        stopRequestedRef,
      },
      state: {
        setCompletedTranscripts,
        setPartialTranscriptMap,
        setIsActive,
        setIsActivating,
        setActiveMode,
      },
    });
  };

  const startNativeTranscript = async (language: SupportedLanguage) => {
    await startNativeRealtimeTranscript({
      language,
      refs: {
        pcRef,
        dcRef,
        recognitionRef,
        stopRequestedRef,
      },
      state: {
        setCompletedTranscripts,
        setPartialTranscriptMap,
        setIsActive,
        setIsActivating,
        setActiveMode,
      },
      startAiFallback: () => startAiTranscript(language),
    });
  };

  const start = async ({ mode, language }: StartRealtimeTranscriptParams) => {
    if (pcRef.current || recognitionRef.current) return;

    const nextLanguage = language ?? settings.languageCode ?? 'en';

    setIsActive(false);
    setIsActivating(true);
    resetTranscriptState();

    if (mode === 'native') {
      try {
        await startNativeTranscript(nextLanguage);
        return;
      } catch (error) {
        cleanup();
        setIsActivating(false);
        throw error;
      }
    }

    try {
      await startAiTranscript(nextLanguage);
    } catch (err) {
      cleanup();
      setIsActivating(false);
      throw err;
    }
  };

  const stop = () => {
    stopRequestedRef.current = true;
    setIsActive(false);
    setIsActivating(false);
    cleanup();
  };

  const clear = () => {
    setCompletedTranscripts([]);
    setPartialTranscriptMap({});
  };

  return {
    partialTranscript,
    completedTranscripts,
    transcript: partialTranscript
      ? [...completedTranscripts, partialTranscript]
      : completedTranscripts,
    start,
    stop,
    clear,
    isActivating,
    isActive,
    activeMode,
  };
};
