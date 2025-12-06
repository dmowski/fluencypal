import { useAuth } from "@/features/Auth/useAuth";
import { InterviewQuizContextType, InterviewQuizProps, QuizStep } from "./types";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { useQuizCore } from "../useQuizCore";
import { db } from "@/features/Firebase/firebaseDb";
import { InterviewQuizSurvey } from "../../../types";
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

  const currentStepData = quiz.steps.find((step) => step.id === core.currentStep) || null;

  return {
    survey: data.survey,
    isCanGoToMainPage: core.isCanGoToMainPage,
    currentStep: currentStepData,
    isStepLoading: core.isStateLoading,
    isFirstStep: core.isFirstStep,
    isLastStep: core.isLastStep,
    nextStep: core.nextStep,
    navigateToMainPage: core.navigateToMainPage,
    prevStep: core.prevStep,
    progress: core.progress,
    isFirstLoading: core.isFirstLoading,
    updateSurvey: data.updateSurvey,
  };
}
