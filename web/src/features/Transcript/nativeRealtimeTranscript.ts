import { speechRecognitionLanguages } from '../Lang/lang';
import type { SupportedLanguage } from '../Lang/lang';
import type {
  BrowserSpeechRecognitionConstructor,
  TranscriptRefs,
  TranscriptStateHandlers,
} from './types';

const NATIVE_PARTIAL_ID = 'native-partial';

const getSpeechRecognitionConstructor = (): BrowserSpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') return null;

  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
};

export const cleanupNativeRealtimeTranscript = ({
  recognitionRef,
  setPartialTranscriptMap,
}: Pick<TranscriptRefs, 'recognitionRef'> &
  Pick<TranscriptStateHandlers, 'setPartialTranscriptMap'>) => {
  const recognition = recognitionRef.current;
  recognitionRef.current = null;

  if (recognition) {
    recognition.onstart = null;
    recognition.onend = null;
    recognition.onerror = null;
    recognition.onresult = null;

    try {
      recognition.abort();
    } catch {
      // noop
    }
  }

  setPartialTranscriptMap((prev) => {
    if (!prev[NATIVE_PARTIAL_ID]) return prev;

    const next = { ...prev };
    delete next[NATIVE_PARTIAL_ID];
    return next;
  });
};

export const startNativeRealtimeTranscript = async ({
  language,
  refs,
  state,
  startAiFallback,
}: {
  language: SupportedLanguage;
  refs: TranscriptRefs;
  state: TranscriptStateHandlers;
  startAiFallback: () => Promise<void>;
}) => {
  const SpeechRecognition = getSpeechRecognitionConstructor();
  const browserLanguage = speechRecognitionLanguages[language];

  if (!SpeechRecognition || !browserLanguage) {
    await startAiFallback();
    return;
  }

  if (refs.recognitionRef.current) return;

  refs.stopRequestedRef.current = false;

  await new Promise<void>((resolve, reject) => {
    let isSettled = false;

    const recognition = new SpeechRecognition();
    refs.recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = browserLanguage;

    const resolveOnce = () => {
      if (isSettled) return;
      isSettled = true;
      resolve();
    };

    const rejectOnce = (error: Error) => {
      if (isSettled) return;
      isSettled = true;
      reject(error);
    };

    recognition.onstart = () => {
      state.setActiveMode('native');
      state.setIsActive(true);
      state.setIsActivating(false);
      resolveOnce();
    };

    recognition.onresult = (event) => {
      const nextCompleted: string[] = [];
      let nextPartial = '';

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const transcript = result?.[0]?.transcript?.trim() || '';

        if (!transcript) continue;

        if (result.isFinal) {
          nextCompleted.push(transcript);
        } else {
          nextPartial += `${nextPartial ? ' ' : ''}${transcript}`;
        }
      }

      if (nextCompleted.length > 0) {
        state.setCompletedTranscripts((prev) => [...prev, ...nextCompleted]);
      }

      state.setPartialTranscriptMap((prev) => {
        if (!nextPartial) {
          if (!prev[NATIVE_PARTIAL_ID]) return prev;

          const next = { ...prev };
          delete next[NATIVE_PARTIAL_ID];
          return next;
        }

        return { ...prev, [NATIVE_PARTIAL_ID]: nextPartial };
      });
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted' && refs.stopRequestedRef.current) {
        return;
      }

      if (event.error === 'language-not-supported') {
        cleanupNativeRealtimeTranscript({
          recognitionRef: refs.recognitionRef,
          setPartialTranscriptMap: state.setPartialTranscriptMap,
        });

        if (!isSettled) {
          rejectOnce(new Error('language-not-supported'));
          return;
        }

        state.setIsActive(false);
        state.setIsActivating(true);
        state.setActiveMode(null);
        void startAiFallback().catch((error) => {
          state.setIsActive(false);
          state.setIsActivating(false);
          state.setActiveMode(null);
          console.error('Failed to fallback to AI transcript', error);
        });
        return;
      }

      state.setIsActive(false);
      state.setIsActivating(false);
      state.setActiveMode(null);
      cleanupNativeRealtimeTranscript({
        recognitionRef: refs.recognitionRef,
        setPartialTranscriptMap: state.setPartialTranscriptMap,
      });
      rejectOnce(new Error(`Native transcript failed: ${event.error}`));
    };

    recognition.onend = () => {
      state.setIsActive(false);
      state.setIsActivating(false);
      state.setActiveMode(null);
      cleanupNativeRealtimeTranscript({
        recognitionRef: refs.recognitionRef,
        setPartialTranscriptMap: state.setPartialTranscriptMap,
      });

      if (!isSettled && !refs.stopRequestedRef.current) {
        rejectOnce(new Error('Native transcript ended before it became active'));
      }
    };

    try {
      recognition.start();
    } catch (error) {
      cleanupNativeRealtimeTranscript({
        recognitionRef: refs.recognitionRef,
        setPartialTranscriptMap: state.setPartialTranscriptMap,
      });
      rejectOnce(error instanceof Error ? error : new Error('Failed to start native transcript'));
    }
  }).catch(async (error) => {
    if (error instanceof Error && error.message === 'language-not-supported') {
      await startAiFallback();
      return;
    }

    throw error;
  });
};
