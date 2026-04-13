'use client';

import { SupportedLanguage } from '@/features/Lang/lang';
import {
  InterviewCoreData,
  InterviewQuiz,
  InterviewQuizStep,
  InterviewQuizSurvey,
  QuizOption,
} from '../../../types';

export type QuizStep = string;

export interface InterviewQuizContextType {
  currentStep: InterviewQuizStep | null;
  isStateLoading: boolean;

  nextStep: () => void;
  openApp: () => void;
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
    survey: InterviewQuizSurvey,
    stepId: string,
    answerTranscription: string,
  ) => Promise<InterviewQuizSurvey>;
  isAnalyzingInputs: Record<string, boolean>;
  isAnalyzingInputsError: Record<string, string>;
  mainPageUrl: string;
  isNavigateToMainPage: boolean;

  getSelectedOptionsForStep: (stepId: string) => QuizOption[];
  updateSelectedOptionsForStep: (
    survey: InterviewQuizSurvey,
    stepId: string,
    selectedOptions: QuizOption[],
  ) => Promise<InterviewQuizSurvey>;

  isRedirecting: boolean;
}

export interface InterviewQuizProps {
  coreData: InterviewCoreData;
  quiz: InterviewQuiz;
  lang: SupportedLanguage;
  interviewId: string;
}
