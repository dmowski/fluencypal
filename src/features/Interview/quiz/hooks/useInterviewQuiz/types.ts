"use client";

import { SupportedLanguage } from "@/features/Lang/lang";
import {
  InterviewCoreData,
  InterviewQuiz,
  InterviewQuizStep,
  InterviewQuizSurvey,
} from "../../../types";

export type QuizStep = string;

export interface InterviewQuizContextType {
  currentStep: InterviewQuizStep | null;
  isStateLoading: boolean;

  nextStep: () => void;
  prevStep: () => void;
  navigateToMainPage: () => void;
  progress: number;
  isFirstStep: boolean;
  isLastStep: boolean;

  isCanGoToMainPage: boolean;
  isFirstLoading: boolean;
  survey: InterviewQuizSurvey | null;
  updateSurvey: (surveyDoc: InterviewQuizSurvey, label: string) => Promise<InterviewQuizSurvey>;
  updateAnswerTranscription: (
    stepId: string,
    answerTranscription: string
  ) => Promise<InterviewQuizSurvey>;
  isAnalyzingInputs: Record<string, boolean>;
  isAnalyzingInputsError: Record<string, string>;
  mainPageUrl: string;
}

export interface InterviewQuizProps {
  coreData: InterviewCoreData;
  quiz: InterviewQuiz;
  lang: SupportedLanguage;
  interviewId: string;
}
