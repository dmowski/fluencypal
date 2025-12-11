"use client";

import { useWindowSizes } from "@/features/Layout/useWindowSizes";
import { UIProgressBar } from "@/features/Survey/UIProgressBar";
import { useTgNavigation } from "@/features/Telegram/useTgNavigation";
import { useEffect } from "react";

export const QuizProgressBar = ({
  navigateToMainPage,
  isCanGoToMainPage,
  isFirstStep,
  prevStep,
  progress,
  width,
}: {
  navigateToMainPage: () => void;
  isCanGoToMainPage: boolean;
  isFirstStep: boolean;
  prevStep: () => void;
  progress: number;
  width: string;
}) => {
  const { topOffset } = useWindowSizes();
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
      width={width}
    />
  );
};
