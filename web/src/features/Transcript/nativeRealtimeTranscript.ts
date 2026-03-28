import { speechRecognitionLanguages } from '../Lang/lang';
import type { SupportedLanguage } from '../Lang/lang';
import type {
  BrowserSpeechRecognitionEvent,
  BrowserSpeechRecognitionConstructor,
  TranscriptRefs,
  TranscriptStateHandlers,
} from './types';

const RECOVERABLE_NATIVE_ERRORS = new Set(['aborted', 'no-speech']);

const normalizeTranscript = (text: string): string => text.replace(/\s+/g, ' ').trim();

const mergeTranscriptText = (current: string, next: string): string => {
  const normalizedCurrent = normalizeTranscript(current);
  const normalizedNext = normalizeTranscript(next);

  if (!normalizedCurrent) return normalizedNext;
  if (!normalizedNext) return normalizedCurrent;

  const currentParts = normalizedCurrent.split(' ');
  const nextParts = normalizedNext.split(' ');
  const maxOverlap = Math.min(currentParts.length, nextParts.length);

  for (let overlap = maxOverlap; overlap > 0; overlap -= 1) {
    const currentSuffix = currentParts.slice(currentParts.length - overlap).join(' ');
    const nextPrefix = nextParts.slice(0, overlap).join(' ');

    if (currentSuffix === nextPrefix) {
      return [...currentParts, ...nextParts.slice(overlap)].join(' ');
    }
  }

  return `${normalizedCurrent} ${normalizedNext}`;
};

const mergeTranscriptParts = (parts: string[]): string => {
  let result = '';

  for (const part of parts) {
    result = mergeTranscriptText(result, part);
  }

  return result;
};

const syncNativeTranscriptState = ({
  event,
  persistedCompletedTranscript,
  completedByIndex,
  partialByIndex,
  state,
}: {
  event: BrowserSpeechRecognitionEvent;
  persistedCompletedTranscript: string;
  completedByIndex: Record<number, string>;
  partialByIndex: Record<number, string>;
  state: TranscriptStateHandlers;
}): { completedTranscript: string; combinedTranscript: string } => {
  for (let index = event.resultIndex; index < event.results.length; index += 1) {
    const result = event.results[index];
    const transcript = normalizeTranscript(result?.[0]?.transcript || '');

    if (result.isFinal) {
      if (transcript) {
        completedByIndex[index] = transcript;
      } else {
        delete completedByIndex[index];
      }

      delete partialByIndex[index];
    } else {
      if (transcript) {
        partialByIndex[index] = transcript;
      } else {
        delete partialByIndex[index];
      }

      delete completedByIndex[index];
    }
  }

  const maxIndex = event.results.length;

  for (const key of Object.keys(completedByIndex)) {
    if (Number(key) >= maxIndex) {
      delete completedByIndex[Number(key)];
    }
  }

  for (const key of Object.keys(partialByIndex)) {
    if (Number(key) >= maxIndex) {
      delete partialByIndex[Number(key)];
    }
  }

  const completedSegments = Object.keys(completedByIndex)
    .map((key) => Number(key))
    .sort((a, b) => a - b)
    .map((key) => completedByIndex[key])
    .filter(Boolean);

  const partialSegments = Object.keys(partialByIndex)
    .map((key) => Number(key))
    .sort((a, b) => a - b)
    .map((key) => partialByIndex[key])
    .filter(Boolean);

  const recognitionCompleted = mergeTranscriptParts(completedSegments);
  const nextCompletedTranscript = mergeTranscriptText(
    persistedCompletedTranscript,
    recognitionCompleted,
  );
  const partialTranscript = mergeTranscriptParts(partialSegments);
  const combinedTranscript = mergeTranscriptText(nextCompletedTranscript, partialTranscript);

  state.setTranscript(combinedTranscript);

  return { completedTranscript: nextCompletedTranscript, combinedTranscript };
};

const getSpeechRecognitionConstructor = (): BrowserSpeechRecognitionConstructor | null => {
  if (typeof window === 'undefined') return null;

  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
};

export const cleanupNativeRealtimeTranscript = ({
  recognitionRef,
}: Pick<TranscriptRefs, 'recognitionRef'>) => {
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
    let persistedCompletedTranscript = '';
    let restartTimeoutId: number | null = null;
    let isRestarting = false;

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

    const clearRestartTimeout = () => {
      if (restartTimeoutId === null) return;

      window.clearTimeout(restartTimeoutId);
      restartTimeoutId = null;
    };

    const stopNativeTranscript = () => {
      clearRestartTimeout();
      state.setIsActive(false);
      state.setIsActivating(false);
      state.setActiveMode(null);
      state.setTranscript((prev) => normalizeTranscript(prev));
      cleanupNativeRealtimeTranscript({
        recognitionRef: refs.recognitionRef,
      });
    };

    const startRecognition = () => {
      const recognition = new SpeechRecognition();
      let latestCompletedTranscript = persistedCompletedTranscript;
      const completedByIndex: Record<number, string> = {};
      const partialByIndex: Record<number, string> = {};

      refs.recognitionRef.current = recognition;
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = browserLanguage;

      recognition.onstart = () => {
        isRestarting = false;
        state.setActiveMode('native');
        state.setIsActive(true);
        state.setIsActivating(false);
        resolveOnce();
      };

      recognition.onresult = (event) => {
        const nextState = syncNativeTranscriptState({
          event,
          persistedCompletedTranscript,
          completedByIndex,
          partialByIndex,
          state,
        });
        latestCompletedTranscript = nextState.completedTranscript;
      };

      recognition.onerror = (event) => {
        if (RECOVERABLE_NATIVE_ERRORS.has(event.error)) {
          state.setTranscript(latestCompletedTranscript);
          return;
        }

        if (event.error === 'language-not-supported') {
          cleanupNativeRealtimeTranscript({
            recognitionRef: refs.recognitionRef,
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

        stopNativeTranscript();
        rejectOnce(new Error(`Native transcript failed: ${event.error}`));
      };

      recognition.onend = () => {
        if (refs.recognitionRef.current === recognition) {
          refs.recognitionRef.current = null;
        }

        persistedCompletedTranscript = latestCompletedTranscript;
        state.setTranscript(persistedCompletedTranscript);

        if (refs.stopRequestedRef.current) {
          clearRestartTimeout();
          state.setIsActive(false);
          state.setIsActivating(false);
          state.setActiveMode(null);
          state.setTranscript(persistedCompletedTranscript);
          return;
        }

        if (!isSettled) {
          stopNativeTranscript();
          rejectOnce(new Error('Native transcript ended before it became active'));
          return;
        }

        if (isRestarting) {
          return;
        }

        isRestarting = true;
        state.setIsActive(true);
        state.setIsActivating(false);

        restartTimeoutId = window.setTimeout(() => {
          restartTimeoutId = null;

          if (refs.stopRequestedRef.current || refs.recognitionRef.current) {
            isRestarting = false;
            return;
          }

          startRecognition();
        }, 150);
      };

      try {
        recognition.start();
      } catch (error) {
        if (refs.recognitionRef.current === recognition) {
          refs.recognitionRef.current = null;
        }
        state.setTranscript(latestCompletedTranscript);

        if (!isSettled) {
          rejectOnce(
            error instanceof Error ? error : new Error('Failed to start native transcript'),
          );
          return;
        }

        stopNativeTranscript();
      }
    };

    startRecognition();
  }).catch(async (error) => {
    if (error instanceof Error && error.message === 'language-not-supported') {
      await startAiFallback();
      return;
    }

    throw error;
  });
};
