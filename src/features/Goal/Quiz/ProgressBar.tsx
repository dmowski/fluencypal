"use client";

import { useQuiz } from "./useQuiz";
import { QuizProgressBar } from "./components/QuizProgressBar";

export const ProgressBar = () => {
  const {
    navigateToMainPage,
    isCanGoToMainPage,
    isFirstStep,
    prevStep,
    progress,
  } = useQuiz();

  return (
    <QuizProgressBar
      navigateToMainPage={navigateToMainPage}
      isCanGoToMainPage={isCanGoToMainPage}
      isFirstStep={isFirstStep}
      prevStep={prevStep}
      progress={progress}
      width="600px"
    />
  );
};
