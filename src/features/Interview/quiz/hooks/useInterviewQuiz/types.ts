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
  isStepLoading: boolean;

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
}

export interface InterviewQuizProps {
  coreData: InterviewCoreData;
  quiz: InterviewQuiz;
  lang: SupportedLanguage;
  interviewId: string;
}
