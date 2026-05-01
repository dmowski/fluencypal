import { useEffect, useRef, useState } from 'react';
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

const stopOthersEventName = 'darkeng:realtime-transcript-stop-others';

type StopOthersEventDetail = {
  requesterId: string;
};

export const useRealtimeTranscript = () => {
  const [transcript, setTranscript] = useState('');
  const [isActive, setIsActive] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [activeMode, setActiveMode] = useState<TranscriptMode | null>(null);

  const settings = useSettings();
  const auth = useAuth();

  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const stopRequestedRef = useRef(false);
  const instanceIdRef = useRef(
    `realtime-transcript-${Math.random().toString(36).slice(2, 10)}-${Date.now()}`,
  );

  const cleanup = () => {
    cleanupNativeRealtimeTranscript({ recognitionRef });
    cleanupOpenAiRealtimeTranscript({
      pcRef,
      dcRef,
      recognitionRef,
      stopRequestedRef,
    });
    setActiveMode(null);
  };

  const resetTranscriptState = () => {
    setTranscript('');
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
        setTranscript,
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
        recognitionRef,
        stopRequestedRef,
      },
      state: {
        setTranscript,
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
    setTranscript('');
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const onStopOthers = (event: Event) => {
      const customEvent = event as CustomEvent<StopOthersEventDetail>;
      const requesterId = customEvent.detail?.requesterId;

      if (requesterId === instanceIdRef.current) {
        return;
      }

      if (!pcRef.current && !recognitionRef.current && !isActive && !isActivating) {
        return;
      }

      stopRequestedRef.current = true;
      setIsActive(false);
      setIsActivating(false);
      cleanup();
    };

    window.addEventListener(stopOthersEventName, onStopOthers);

    return () => {
      window.removeEventListener(stopOthersEventName, onStopOthers);
    };
  }, [isActive, isActivating]);

  const requestStopOthers = () => {
    if (typeof window === 'undefined') return;

    window.dispatchEvent(
      new CustomEvent<StopOthersEventDetail>(stopOthersEventName, {
        detail: { requesterId: instanceIdRef.current },
      }),
    );
  };

  const startWithGuard = async (params: StartRealtimeTranscriptParams) => {
    requestStopOthers();
    await start(params);
  };

  return {
    transcript,
    start: startWithGuard,
    stop,
    clear,
    isActivating,
    isActive,
    activeMode,
  };
};
