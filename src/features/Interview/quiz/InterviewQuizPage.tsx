"use client";

import { SupportedLanguage } from "@/features/Lang/lang";
import { InterviewCoreData, InterviewQuiz } from "../types";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { Stack } from "@mui/material";
import { QuizProgressBar } from "@/features/Goal/Quiz/components/QuizProgressBar";
import { useRouter } from "next/navigation";
import { InfoStep } from "@/features/Survey/InfoStep";
import { AboutYourselfList } from "@/features/Goal/Quiz/AboutYourselfList";
import { useLingui } from "@lingui/react";
import { useInterviewQuiz } from "./useInterviewQuiz";

export interface InterviewQuizPageProps {
  interviewCoreData: InterviewCoreData;
  interviewQuiz: InterviewQuiz;
  lang: SupportedLanguage;
  id: string;
}

export const InterviewQuizPage = ({ interviewCoreData, lang, id }: InterviewQuizPageProps) => {
  const pageUrl = getUrlStart(lang) + `interview/${id}`;
  const { i18n } = useLingui();
  const router = useRouter();
  const quiz = useInterviewQuiz();

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
      </Stack>
    </Stack>
  );
};
