"use client";

import { useEffect } from "react";
import { useWindowSizes } from "@/features/Layout/useWindowSizes";
import { useTgNavigation } from "@/features/Telegram/useTgNavigation";
import { useQuiz } from "./useQuiz";
import { UIProgressBar } from "./ui/UIProgressBar";

export const ProgressBar = () => {
  const { topOffset } = useWindowSizes();
  const { navigateToMainPage, isCanGoToMainPage, isFirstStep, prevStep, progress } = useQuiz();
  const tgNavigation = useTgNavigation();

  useEffect(() => {
    const off = tgNavigation.addBackHandler(prevStep);
    return off;
  }, [prevStep]);

  const handleBackClick = () => {
    if (isFirstStep) {
      isCanGoToMainPage && navigateToMainPage();
    } else {
      prevStep();
    }
  };

  return (
    <UIProgressBar
      topOffset={topOffset}
      isCanGoToMainPage={isCanGoToMainPage}
      isFirstStep={isFirstStep}
      progress={progress}
      onBackClick={handleBackClick}
    />
  );
};
