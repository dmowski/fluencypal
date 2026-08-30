'use client';

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  JSX,
} from 'react';
import { useAuth } from '@/features/Auth/useAuth';
import { useSettings } from '@/features/Settings/useSettings';
import { useTextAi } from '@/features/Ai/useTextAi';
import { useChatHistory } from '@/features/ConversationHistory/useChatHistory';
import { useAiUserInfo } from '@/features/User/useAiUserInfo';
import { usePlan } from '@/features/Plan/usePlan';
import { useUrlState } from '@/features/Url/useUrlState';
import { MAX_CONVERSATIONS_TO_SCAN, LESSON_AI_MODEL } from './constants';
import { collectConversationContext } from './collectConversationContext';
import { generateInteractiveLesson } from './generateLesson';
import { generateSpeechAnswerFeedback } from './generateAnswerFeedback';
import { generateLessonResults } from './generateLessonResults';
import { recordLessonAudio } from './audioProgress';
import {
  applyLessonResults,
  applySpeechAnswer,
  discardCurrentLesson,
  emptyLessonStore,
  isLessonCompletedToday,
  isLessonFinished,
  promoteFinishedLesson,
  listRecentLessonForms,
  summarizeFinishedLessons,
  summarizeOpenTalks,
} from './lessonState';
import { loadInteractiveLessonStore, saveInteractiveLessonStore } from './interactiveLessonFirestore';
import { uploadLessonAudio } from './uploadLessonAudio';
import {
  InteractiveLesson,
  InteractiveLessonStore,
  isOpenTalkPart,
  LessonGenerationContext,
} from './types';
import { USER_LESSON_ERROR } from './lessonErrors';
import { useDailyTasks } from '@/features/Tasks/useDailyTasks';
const inFlightLessonByKey = new Map<string, Promise<InteractiveLesson>>();
const logLessonError = (phase: string, error: unknown, extra?: Record<string, unknown>) => {
  console.error('[interactiveLesson] failed', {
    phase,
    model: LESSON_AI_MODEL,
    message: error instanceof Error ? error.message : String(error),
    cause: error instanceof Error ? error.cause : undefined,
    ...extra,
  });
};

const buildGoalText = (params: {
  goalTitle?: string;
  goalElementsText?: string;
  advancedUserRecords?: string;
}): string => {
  return [params.goalTitle, params.goalElementsText, params.advancedUserRecords]
    .map((value) => value?.trim() || '')
    .filter(Boolean)
    .join('\n\n');
};

const useProvideInteractiveLesson = () => {
  const auth = useAuth();
  const settings = useSettings();
  const textAi = useTextAi();
  const chatHistory = useChatHistory();
  const aiUserInfo = useAiUserInfo();
  const plan = usePlan();
  const dailyTasks = useDailyTasks();

  const [isOpen, setIsOpen] = useUrlState('interactiveLesson', '', false);
  const [isProgressOpen, setIsProgressOpen] = useUrlState('interactiveLessonProgress', '', false);

  const userId = auth.uid || '';
  const languageCode = settings.languageCode || 'en';
  const pendingAudioUploads = useRef(new Map<number, Promise<string | undefined>>());

  const [store, setStore] = useState<InteractiveLessonStore>(emptyLessonStore);
  const [isStoreReady, setIsStoreReady] = useState(false);
  const [isGeneratingLesson, setIsGeneratingLesson] = useState(false);
  const [isGeneratingNext, setIsGeneratingNext] = useState(false);
  const [isGeneratingResults, setIsGeneratingResults] = useState(false);
  const [evaluatingPartIndex, setEvaluatingPartIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const storeRef = useRef(store);
  storeRef.current = store;
  const bannedFormsRef = useRef<Array<Pick<InteractiveLesson, 'title' | 'subTitle'>>>([]);

  const isSettingsReady = !settings.loading && !!userId;

  useEffect(() => {
    if (!isSettingsReady) {
      setStore(emptyLessonStore());
      setIsStoreReady(false);
      return;
    }

    let cancelled = false;
    setIsStoreReady(false);
    void loadInteractiveLessonStore(userId, languageCode)
      .then((loaded) => {
        if (cancelled) return;
        storeRef.current = loaded;
        setStore(loaded);
        setIsStoreReady(true);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error('Failed to load interactive lesson', error);
        storeRef.current = emptyLessonStore();
        setStore(emptyLessonStore());
        setIsStoreReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [isSettingsReady, userId, languageCode]);

  const nativeLanguageCode = settings.userSettings?.nativeLanguageCode ?? null;
  const targetLanguageCode = settings.languageCode;
  const isUserReady = isSettingsReady && isStoreReady;
  const needsLanguageSetup =
    isUserReady &&
    (!nativeLanguageCode || !targetLanguageCode || nativeLanguageCode === targetLanguageCode);

  const persistUpdate = (updater: (prev: InteractiveLessonStore) => InteractiveLessonStore) => {
    const next = updater(storeRef.current);
    storeRef.current = next;
    setStore(next);
    if (userId && isStoreReady) {
      void saveInteractiveLessonStore(userId, languageCode, next).catch((error) => {
        console.error('Failed to save interactive lesson', error);
      });
    }
    return next;
  };

  const gatherContext = async (
    currentStore: InteractiveLessonStore,
  ): Promise<LessonGenerationContext> => {
    let conversationText = '';
    let conversationMessageCount = 0;

    try {
      const conversations = await chatHistory.getLastConversations(MAX_CONVERSATIONS_TO_SCAN);
      const collected = collectConversationContext(conversations);
      conversationText = collected.text;
      conversationMessageCount = collected.messageCount;
    } catch {
      conversationText = '';
      conversationMessageCount = 0;
    }

    const goalElementsText = plan.activeGoal?.elements
      ?.map((element) => `${element.title}: ${element.description}`)
      .join('\n');

    const finished = [
      ...(currentStore.currentLesson?.lessonResults ? [currentStore.currentLesson] : []),
      ...currentStore.history,
    ];
    const recentForms = [
      ...bannedFormsRef.current,
      currentStore.currentLesson,
      currentStore.nextLesson,
      ...currentStore.history,
    ].filter((lesson): lesson is NonNullable<typeof lesson> => !!lesson);

    return {
      conversationText,
      conversationMessageCount,
      userGoalText: buildGoalText({
        goalTitle: plan.activeGoal?.title,
        goalElementsText,
        advancedUserRecords: aiUserInfo.advancedUserRecords,
      }),
      previousLessonsSummary: summarizeFinishedLessons(finished),
      openTalkSummary: summarizeOpenTalks(finished),
      recentFormsSummary: listRecentLessonForms(recentForms),
    };
  };

  const runLessonGeneration = async (
    key: string,
    mode: 'first' | 'next',
    currentStore: InteractiveLessonStore,
    extraPreviousSummary = '',
    extraRecentForms = '',
  ): Promise<InteractiveLesson> => {
    const existing = inFlightLessonByKey.get(key);
    if (existing) return existing;

    if (!targetLanguageCode || !nativeLanguageCode) {
      throw new Error('Languages are not set');
    }

    const promise = (async () => {
      const context = await gatherContext(currentStore);
      return generateInteractiveLesson({
        textAi,
        mode,
        context: {
          ...context,
          previousLessonsSummary: [extraPreviousSummary, context.previousLessonsSummary]
            .filter(Boolean)
            .join('\n\n'),
          recentFormsSummary: [extraRecentForms, context.recentFormsSummary]
            .filter(Boolean)
            .join('\n'),
        },
        targetLanguageCode,
        nativeLanguageCode,
      });
    })();

    inFlightLessonByKey.set(key, promise);
    try {
      return await promise;
    } finally {
      inFlightLessonByKey.delete(key);
    }
  };

  const upcomingKey = `${userId}:${languageCode}:upcoming`;

  const ensureCurrentLesson = async () => {
    if (!isStoreReady || needsLanguageSetup) return;

    let currentStore = storeRef.current;
    if (isLessonFinished(currentStore.currentLesson)) {
      currentStore = persistUpdate(promoteFinishedLesson);
    }
    if (currentStore.currentLesson) return;

    setErrorMessage('');
    setIsGeneratingLesson(true);
    try {
      const hasPreviousResults = currentStore.history.some((lesson) => !!lesson.lessonResults);
      const lesson = await runLessonGeneration(
        hasPreviousResults ? upcomingKey : `${userId}:${languageCode}:first`,
        hasPreviousResults ? 'next' : 'first',
        currentStore,
      );
      persistUpdate((prev) => ({
        ...prev,
        currentLesson: prev.currentLesson || lesson,
        nextLesson: prev.nextLesson?.id === lesson.id ? null : prev.nextLesson,
      }));
    } catch (error) {
      logLessonError('ensureCurrentLesson', error, { userId, languageCode });
      setErrorMessage(USER_LESSON_ERROR);
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  const prepareSpeechAudio = (partIndex: number, blob: Blob) => {
    const lesson = storeRef.current.currentLesson;
    if (!lesson || pendingAudioUploads.current.has(partIndex)) return;

    pendingAudioUploads.current.set(
      partIndex,
      (async () => {
        const token = await auth.getToken();
        return (
          (await uploadLessonAudio({
            blob,
            lessonId: lesson.id,
            partIndex,
            token: token || '',
          })) || undefined
        );
      })(),
    );
  };

  const submitSpeechAnswer = async (partIndex: number, transcript: string, audioBlob: Blob | null) => {
    const lesson = store.currentLesson;
    if (!lesson || !targetLanguageCode || !nativeLanguageCode) return;

    setErrorMessage('');
    setEvaluatingPartIndex(partIndex);
    if (audioBlob) prepareSpeechAudio(partIndex, audioBlob);

    try {
      const [userAudioUrl, aiResultToUser] = await Promise.all([
        pendingAudioUploads.current.get(partIndex) ?? Promise.resolve(undefined),
        generateSpeechAnswerFeedback({
          textAi,
          partContentMD: lesson.parts[partIndex]?.contentMD || '',
          userVoiceTranscript: transcript,
          targetLanguageCode,
          nativeLanguageCode,
          isOpenTalk: isOpenTalkPart(lesson.parts, partIndex),
        }),
      ]);
      pendingAudioUploads.current.delete(partIndex);
      persistUpdate((prev) => ({
        ...prev,
        currentLesson: prev.currentLesson
          ? applySpeechAnswer(prev.currentLesson, partIndex, {
              userVoiceTranscript: transcript,
              aiResultToUser,
              userAudioUrl,
            })
          : prev.currentLesson,
        audioProgress: userAudioUrl
          ? recordLessonAudio(prev.audioProgress, {
              id: `${lesson.id}-${partIndex}-${Date.now()}`,
              audioUrl: userAudioUrl,
              transcript,
              recordedAtIso: new Date().toISOString(),
            })
          : prev.audioProgress,
      }));
    } catch (error) {
      logLessonError('submitSpeechAnswer', error, { lessonId: lesson.id, partIndex });
      setErrorMessage(USER_LESSON_ERROR);
    } finally {
      setEvaluatingPartIndex(null);
    }
  };

  const finishCurrentLesson = async () => {
    const lesson = store.currentLesson;
    if (!lesson || !targetLanguageCode || !nativeLanguageCode) return;
    if (lesson.lessonResults) return;

    void dailyTasks.onCompleteTask('interactive-lesson').catch((error) => {
      logLessonError('markDailyTask', error, { lessonId: lesson.id });
    });

    setErrorMessage('');
    setIsGeneratingResults(true);
    setIsGeneratingNext(true);

    const completedAtIso = new Date().toISOString();

    const resultsPromise = generateLessonResults({
      textAi,
      lesson,
      targetLanguageCode,
    })
      .then((lessonResults) => {
        persistUpdate((prev) => ({
          ...prev,
          lastCompletedAtIso: completedAtIso,
          currentLesson: prev.currentLesson
            ? applyLessonResults(prev.currentLesson, lessonResults, completedAtIso)
            : prev.currentLesson,
        }));
      })
      .finally(() => setIsGeneratingResults(false));

    const nextPromise = runLessonGeneration(upcomingKey, 'next', storeRef.current)
      .then((nextLesson) => {
        persistUpdate((prev) => {
          if (!prev.currentLesson) {
            return { ...prev, currentLesson: nextLesson, nextLesson: null };
          }
          if (prev.currentLesson.id === nextLesson.id) return prev;
          return { ...prev, nextLesson };
        });
      })
      .finally(() => setIsGeneratingNext(false));

    try {
      await Promise.all([resultsPromise, nextPromise]);
    } catch (error) {
      logLessonError('finishCurrentLesson', error, { lessonId: lesson.id });
      setErrorMessage(USER_LESSON_ERROR);
    }
  };

  const skipCurrentLesson = async () => {
    const lesson = storeRef.current.currentLesson;
    if (!lesson || !targetLanguageCode || !nativeLanguageCode) return;
    if (lesson.lessonResults) return;

    const skippedNote = [
      'The learner skipped this lesson because they are tired of it.',
      'Generate something COMPLETELY new. Change the language category.',
      'A tighter or themed variant of the same form is a failure (e.g. another -ing / present continuous lesson).',
      `Banned title: ${lesson.title}`,
      `Banned subtitle: ${lesson.subTitle}`,
    ].join('\n');

    const alsoBan = storeRef.current.nextLesson;
    bannedFormsRef.current = [
      { title: lesson.title, subTitle: lesson.subTitle },
      ...(alsoBan ? [{ title: alsoBan.title, subTitle: alsoBan.subTitle }] : []),
      ...bannedFormsRef.current,
    ].slice(0, 10);

    pendingAudioUploads.current.clear();
    setErrorMessage('');
    setIsGeneratingLesson(true);
    const discarded = persistUpdate(discardCurrentLesson);
    try {
      const generated = await runLessonGeneration(
        `${userId}:${languageCode}:after-skip:${lesson.id}`,
        'next',
        discarded,
        skippedNote,
        listRecentLessonForms([
          lesson,
          ...(alsoBan ? [alsoBan] : []),
        ]),
      );
      persistUpdate((prev) => ({
        ...prev,
        currentLesson: prev.currentLesson || generated,
        nextLesson: null,
      }));
    } catch (error) {
      logLessonError('skipCurrentLesson', error, { skippedLessonId: lesson.id });
      setErrorMessage(USER_LESSON_ERROR);
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  const goToNextLesson = async () => {
    const promoted = persistUpdate(promoteFinishedLesson);
    if (promoted.currentLesson) return;

    setErrorMessage('');
    setIsGeneratingLesson(true);
    try {
      const lesson = await runLessonGeneration(upcomingKey, 'next', promoted);
      persistUpdate((prev) => ({
        ...prev,
        currentLesson: prev.currentLesson || lesson,
        nextLesson: prev.nextLesson?.id === lesson.id ? null : prev.nextLesson,
      }));
    } catch (error) {
      logLessonError('goToNextLesson', error, { userId, languageCode });
      setErrorMessage(USER_LESSON_ERROR);
    } finally {
      setIsGeneratingLesson(false);
    }
  };

  const openLesson = () => {
    if (isLessonFinished(storeRef.current.currentLesson)) {
      persistUpdate(promoteFinishedLesson);
    }
    setIsOpen('open');
  };

  const closeLesson = () => {
    if (isLessonFinished(storeRef.current.currentLesson)) {
      persistUpdate(promoteFinishedLesson);
    }
    setIsOpen('');
  };

  return {
    store,
    currentLesson: store.currentLesson,
    nextLesson: store.nextLesson,
    history: store.history,
    audioProgress: store.audioProgress,
    isDoneToday: isLessonCompletedToday(store),
    isStoreReady,
    isUserReady,
    isOpen: isOpen === 'open',
    isProgressOpen: isProgressOpen === 'open',
    needsLanguageSetup,
    nativeLanguageCode,
    targetLanguageCode,
    isGeneratingLesson,
    isGeneratingNext,
    isGeneratingResults,
    evaluatingPartIndex,
    errorMessage,
    openLesson,
    closeLesson,
    openProgress: () => setIsProgressOpen('open'),
    closeProgress: () => setIsProgressOpen(''),
    ensureCurrentLesson,
    prepareSpeechAudio,
    submitSpeechAnswer,
    finishCurrentLesson,
    skipCurrentLesson,
    goToNextLesson,
    setLanguage: settings.setLanguage,
    setNativeLanguage: settings.setNativeLanguage,
  };
};

type InteractiveLessonApi = ReturnType<typeof useProvideInteractiveLesson>;
const InteractiveLessonContext = createContext<InteractiveLessonApi | null>(null);

export function InteractiveLessonProvider({ children }: { children: ReactNode }): JSX.Element {
  const value = useProvideInteractiveLesson();
  return createElement(InteractiveLessonContext.Provider, { value }, children);
}

export const useInteractiveLesson = (): InteractiveLessonApi => {
  const context = useContext(InteractiveLessonContext);
  if (!context) {
    throw new Error('useInteractiveLesson must be used within InteractiveLessonProvider');
  }
  return context;
};

export { isLessonUserError } from './lessonErrors';
