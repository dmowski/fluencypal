"use client";

import { SupportedLanguage } from "@/features/Lang/lang";
import { InterviewCoreData, InterviewQuiz } from "../types";
import { Stack } from "@mui/material";
import { QuizProgressBar } from "@/features/Goal/Quiz/components/QuizProgressBar";
import { InfoStep } from "@/features/Survey/InfoStep";
import { useLingui } from "@lingui/react";
import { useInterviewQuiz } from "./hooks/useInterviewQuiz/useInterviewQuiz";
import { AuthWall } from "@/features/Auth/AuthWall";
import { RecordUserAudio } from "@/features/Goal/Quiz/RecordUserAudio";
import { MIN_CHARACTERS_FOR_TRANSCRIPT } from "./hooks/useInterviewQuiz/data";
import { IconTextList } from "@/features/Survey/IconTextList";

export interface InterviewQuizPageProps {
  interviewCoreData: InterviewCoreData;
  interviewQuiz: InterviewQuiz;
  lang: SupportedLanguage;
  id: string;
}

export const InterviewQuizPage = ({ interviewCoreData, lang, id }: InterviewQuizPageProps) => {
  const quiz = useInterviewQuiz();
  const stepType = quiz.currentStep?.type;
  const { i18n } = useLingui();

  const survey = quiz.survey;

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
        {stepType === "info" && quiz.currentStep && (
          <InfoStep
            message={quiz.currentStep.title}
            subMessage={quiz.currentStep.subTitle || ""}
            imageUrl={quiz.currentStep.imageUrl || "/avatar/owl1.png"}
            onClick={() => quiz.nextStep()}
          />
        )}

        {stepType === "record-audio" && quiz.currentStep && survey && (
          <AuthWall>
            <RecordUserAudio
              title={quiz.currentStep.title}
              subTitle={quiz.currentStep.subTitle}
              subTitleComponent={<IconTextList listItems={quiz.currentStep.listItems || []} />}
              transcript={survey.answers[quiz.currentStep.id]?.answerTranscription || ""}
              minWords={MIN_CHARACTERS_FOR_TRANSCRIPT}
              lang={lang}
              nextStep={quiz.nextStep}
              updateTranscript={async (combinedTranscript) => {
                await quiz.updateAnswerTranscription(
                  quiz.currentStep?.id || "",
                  combinedTranscript
                );
              }}
            />
          </AuthWall>
        )}
      </Stack>
    </Stack>
  );
};
