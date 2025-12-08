"use client";

import { useAuth } from "@/features/Auth/useAuth";
import { InterviewQuizContextType, InterviewQuizProps, QuizStep } from "./types";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { useQuizCore } from "../useQuizCore";
import { db } from "@/features/Firebase/firebaseDb";
import { InterviewQuizAnswer, InterviewQuizSurvey } from "../../../types";
import { useQuizSurveyData } from "../useQuizSurveyData";

const initEmptyData: InterviewQuizSurvey = {
  answers: {},
  createdAtIso: new Date().toISOString(),
  updatedAtIso: new Date().toISOString(),
};

export function useProvideInterviewQuizContext({
  coreData,
  quiz,
  lang,
  interviewId,
}: InterviewQuizProps): InterviewQuizContextType {
  const auth = useAuth();
  const mainPageUrl = getUrlStart(lang) + `interview/${interviewId}`;
  const path: QuizStep[] = quiz.steps.map((step) => step.id);

  const core = useQuizCore({
    path,
    mainPageUrl,
  });
  const data = useQuizSurveyData({
    surveyDocRef: db.documents.interviewQuizSurvey(auth.uid, interviewId),
    initEmptyData: initEmptyData,
  });

  const currentStep = quiz.steps.find((step) => step.id === core.currentStepId) || null;

  const updateAnswerTranscription = async (
    stepId: string,
    fullAnswerTranscription: string
  ): Promise<InterviewQuizSurvey> => {
    if (!data.survey) {
      throw new Error("Survey data is not loaded");
    }

    const answerData: InterviewQuizAnswer = {
      stepId,
      question: currentStep?.title || "",
      answerTranscription: fullAnswerTranscription,
    };

    const oldAnswers = data.survey.answers || {};

    const updatedSurvey: InterviewQuizSurvey = {
      ...data.survey,
      answers: {
        ...oldAnswers,
        [stepId]: answerData,
      },
      updatedAtIso: new Date().toISOString(),
    };

    return await data.updateSurvey(updatedSurvey, `Update answer transcription for step ${stepId}`);
  };

  return {
    survey: data.survey,
    currentStep,
    updateSurvey: data.updateSurvey,
    updateAnswerTranscription,
    ...core,
  };
}
