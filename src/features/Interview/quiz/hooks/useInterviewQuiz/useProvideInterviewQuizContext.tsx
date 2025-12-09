"use client";

import { useAuth } from "@/features/Auth/useAuth";
import { InterviewQuizContextType, InterviewQuizProps, QuizStep } from "./types";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { useQuizCore } from "../useQuizCore";
import { db } from "@/features/Firebase/firebaseDb";
import {
  AnalyzeInputsQuizStep,
  InterviewQuizAnswer,
  InterviewQuizResults,
  InterviewQuizSurvey,
  QuizAnswers,
  QuizResults,
} from "../../../types";
import { useQuizSurveyData } from "../useQuizSurveyData";
import { useEffect, useState } from "react";
import { initEmptyData } from "./data";
import { getHash } from "./hash";
import { useTextAi } from "@/features/Ai/useTextAi";
import { MODELS } from "@/common/ai";

export function useProvideInterviewQuizContext({
  coreData,
  quiz,
  lang,
  interviewId,
}: InterviewQuizProps): InterviewQuizContextType {
  const auth = useAuth();
  const mainPageUrl = getUrlStart(lang) + `interview/${interviewId}`;
  const path: QuizStep[] = quiz.steps.map((step) => step.id);
  const ai = useTextAi();

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
    };

    return await data.updateSurvey(updatedSurvey, `Update answer transcription for step ${stepId}`);
  };

  const [isAnalyzingInputs, setIsAnalyzingInputs] = useState<Record<string, boolean>>({});
  const [isAnalyzingInputsError, setIsAnalyzingInputsError] = useState<Record<string, string>>({});

  const analyzeInputs = async ({
    step,
    answers,
    results,
  }: {
    step: AnalyzeInputsQuizStep;
    answers: QuizAnswers;
    results: QuizResults;
  }) => {
    const stepId = step.id;
    setIsAnalyzingInputs((prev) => ({ ...prev, [stepId]: true }));
    setIsAnalyzingInputsError((prev) => ({ ...prev, [stepId]: "" }));

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
    const survey = data.survey;
    if (!survey) {
      setIsAnalyzingInputsError((prev) => ({ ...prev, [stepId]: "Survey data is not loaded." }));
      setIsAnalyzingInputs((prev) => ({ ...prev, [stepId]: false }));
      return;
    }
    if (!inEnoughDataToAnalyze) {
      const errorMessage = "Not enough data to analyze inputs.";
      setIsAnalyzingInputsError((prev) => ({ ...prev, [stepId]: errorMessage }));
      setIsAnalyzingInputs((prev) => ({ ...prev, [stepId]: false }));
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

    const questionHash = getHash(combinedAnswers);

    const isAlreadyAnswered = questionHash === results[step.id]?.inputHash;
    if (isAlreadyAnswered) {
      console.log("Answered");
      setIsAnalyzingInputs((prev) => ({ ...prev, [stepId]: false }));
      setIsAnalyzingInputsError((prev) => ({ ...prev, [stepId]: "" }));
      return;
    }

    const stepSystemMessage = step.aiSystemPrompt || "";
    const systemMessageWrapper = "Return the response in Markdown format.";
    const systemMessage = `${stepSystemMessage}\n${systemMessageWrapper}`.trim();

    try {
      const response = await ai.generate({
        systemMessage,
        userMessage: combinedAnswers,
        model: MODELS.gpt_4o,
      });
      const markdownFeedback = response.trim();

      if (markdownFeedback.length > 0) {
        const result: InterviewQuizResults = {
          stepId,
          inputHash: questionHash,
          markdownFeedback,
        };
        const oldResults = survey.results || {};
        const updatedSurvey: InterviewQuizSurvey = {
          ...survey,
          results: {
            ...oldResults,
            [stepId]: result,
          },
        };

        await data.updateSurvey(updatedSurvey, `Update analysis results for step ${stepId}`);
      }
    } catch (error) {
      setIsAnalyzingInputsError((prev) => ({ ...prev, [stepId]: String(error) }));
    } finally {
      setIsAnalyzingInputs((prev) => ({ ...prev, [stepId]: false }));
    }

    console.log({ systemMessage, combinedAnswers, questionHash, isAlreadyAnswered });
  };

  const quizAnswers = data.survey?.answers || null;
  const results = data.survey?.results || null;

  useEffect(() => {
    if (currentStep?.type === "analyze-inputs" && quizAnswers && results) {
      analyzeInputs({ step: currentStep, answers: quizAnswers, results });
    }
  }, [currentStep, quizAnswers, results]);

  return {
    ...core,
    survey: data.survey,
    currentStep,
    updateSurvey: data.updateSurvey,
    updateAnswerTranscription,
    isAnalyzingInputs,
    isAnalyzingInputsError,
  };
}
