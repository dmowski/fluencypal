"use client";

import { useAuth } from "@/features/Auth/useAuth";
import { InterviewQuizContextType, InterviewQuizProps, QuizStep } from "./types";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { useQuizCore } from "../useQuizCore";
import { db } from "@/features/Firebase/firebaseDb";
import {
  AnalyzeInputsQuizStep,
  InterviewQuizAnswer,
  InterviewQuizSurvey,
  QuizAnswers,
} from "../../../types";
import { useQuizSurveyData } from "../useQuizSurveyData";
import { useEffect } from "react";

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

  const analyzeInputs = async ({
    step,
    answers,
  }: {
    step: AnalyzeInputsQuizStep;
    answers: QuizAnswers;
  }) => {
    const currentStepIndex = quiz.steps.findIndex((s) => s.id === step.id);
    const previousSteps = quiz.steps.filter((step, index) => {
      return index < currentStepIndex && step.type === "record-audio";
    });
    const previousStepsIdsToAnswer = previousSteps.map((s) => s.id);

    const userAnswersIds = Object.keys(answers);
    const goodAnswersIds = previousStepsIdsToAnswer.filter((answerStepId) => {
      return userAnswersIds.includes(answerStepId);
    });

    const inEnoughDataToAnalyze = goodAnswersIds.length === previousStepsIdsToAnswer.length;
    if (!inEnoughDataToAnalyze) {
      console.log("Not enough data to analyze inputs yet");
      return;
    }

    const combinedAnswers = goodAnswersIds
      .map((id) => {
        const foundStep = quiz.steps.find((step) => step.id === id);
        const questionStep = foundStep?.type === "record-audio" ? foundStep : null;

        const questionTitle = questionStep ? questionStep.title : "Unknown question";
        const questionSubTitle = questionStep ? questionStep.subTitle : "";

        const questionHeader = `Question: ${questionTitle}\n${questionSubTitle}\nAnswer:`;
        const answer = answers[id]?.answerTranscription || "";
        return `${questionHeader}\n${answer}`;
      })
      .join("\n\n");

    console.log(combinedAnswers);
  };

  const quizAnswers = data.survey?.answers || null;

  useEffect(() => {
    if (currentStep?.type === "analyze-inputs" && quizAnswers) {
      analyzeInputs({ step: currentStep, answers: quizAnswers });
    }
  }, [currentStep, quizAnswers]);

  return {
    survey: data.survey,
    currentStep,
    updateSurvey: data.updateSurvey,
    updateAnswerTranscription,
    ...core,
  };
}
