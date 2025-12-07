"use client";

import { SupportedLanguage } from "@/features/Lang/lang";
import { InterviewCoreData, InterviewQuiz } from "../types";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { Stack } from "@mui/material";
import { QuizProgressBar } from "@/features/Goal/Quiz/components/QuizProgressBar";
import { InfoStep } from "@/features/Survey/InfoStep";
import { useLingui } from "@lingui/react";
import { useInterviewQuiz } from "./hooks/useInterviewQuiz/useInterviewQuiz";
import { AuthWall } from "@/features/Auth/AuthWall";
import { InterviewAuthWall } from "@/features/Auth/InterviewAuthWall";

export interface InterviewQuizPageProps {
  interviewCoreData: InterviewCoreData;
  interviewQuiz: InterviewQuiz;
  lang: SupportedLanguage;
  id: string;
}

export const InterviewQuizPage = ({ interviewCoreData, lang, id }: InterviewQuizPageProps) => {
  const quiz = useInterviewQuiz();

  const stepType = quiz.currentStep?.type;

  return (
    <Stack
      component={"main"}
      sx={{
        width: "100%",
        paddingTop: `10px`,
        paddingBottom: `10px`,
        alignItems: "center",
      }}
    >
      <QuizProgressBar
        navigateToMainPage={quiz.navigateToMainPage}
        isCanGoToMainPage={quiz.isCanGoToMainPage}
        isFirstStep={quiz.isFirstStep}
        prevStep={quiz.prevStep}
        progress={quiz.progress}
      />
      <Stack
        sx={{
          maxWidth: "600px",
          padding: "0 10px",
          width: "100%",
        }}
      >
        {stepType === "info" && (
          <InfoStep
            message={quiz.currentStep?.title}
            subMessage={quiz.currentStep?.subTitle || ""}
            imageUrl="/avatar/owl1.png"
            onClick={() => quiz.nextStep()}
            subComponent={
              <Stack
                sx={{
                  paddingTop: "20px",
                }}
              ></Stack>
            }
          />
        )}

        {stepType === "record-audio" && (
          <InterviewAuthWall>
            <span>Audio</span>
          </InterviewAuthWall>
        )}
      </Stack>
    </Stack>
  );
};
