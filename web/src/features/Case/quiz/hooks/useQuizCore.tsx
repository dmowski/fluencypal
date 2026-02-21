'use client';

import { SetUrlStateOptions, useUrlMapState } from '@/features/Url/useUrlParam';
import { isTMA } from '@telegram-apps/sdk-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

export function useQuizCore<Step extends string>({
  path,
  mainPageUrl,
}: {
  path: Step[];
  mainPageUrl: string;
}) {
  const [isFirstLoading, setIsFirstLoading] = useState(true);
  interface QuizCoreUrlState {
    currentStepId: Step;
  }

  const [isNavigateToMainPage, setIsNavigateToMainPage] = useState(false);

  const defaultState: QuizCoreUrlState = useMemo(
    () => ({
      currentStepId: path[0],
    }),
    [],
  );

  const [stateInput, setStateInput, isStateLoading] = useUrlMapState(
    defaultState as unknown as Record<string, string>,
    true,
  );

  const setState = useCallback(
    async (partial: Partial<QuizCoreUrlState>, options?: SetUrlStateOptions) => {
      return await setStateInput(partial as unknown as Record<string, string>, options);
    },
    [setStateInput],
  );

  useEffect(() => {
    if (!isStateLoading && isFirstLoading) {
      setIsFirstLoading(false);
    }
  }, [isStateLoading]);

  const state = stateInput as unknown as QuizCoreUrlState;

  const currentStepIndex =
    path.indexOf(state.currentStepId) > -1 ? path.indexOf(state.currentStepId) : 0;

  const router = useRouter();
  const nextStep = async () => {
    const nextStepIndex = Math.min(currentStepIndex + 1, path.length - 1);
    const nextStep = path[nextStepIndex];
    let newStatePatch: Partial<QuizCoreUrlState> = {
      currentStepId: nextStep,
    };
    let url = await setState(newStatePatch, {
      redirect: false,
    });

    router.push(url || '', { scroll: false });
  };

  const prevStep = useCallback(() => {
    const prevStepIndex = Math.max(currentStepIndex - 1, 0);
    const prevStep = path[prevStepIndex];
    setState({ currentStepId: prevStep });
  }, [currentStepIndex, path, setState]);

  const navigateToMainPage = () => {
    setIsNavigateToMainPage(true);
    router.push(`${mainPageUrl}`);
    setTimeout(() => {
      setIsNavigateToMainPage(false);
    }, 3000);
  };

  const progress = currentStepIndex / path.length + 0.1;

  const isTelegramApp = useMemo(() => isTMA(), []);
  const isCanGoToMainPage = !isTelegramApp;

  return {
    isFirstLoading,
    isNavigateToMainPage,
    setState,
    stateInput,
    state,
    prevStep,
    nextStep,
    isStateLoading,
    navigateToMainPage,
    progress,
    isCanGoToMainPage,
    currentStepId: state.currentStepId,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === path.length - 1,
  };
}
