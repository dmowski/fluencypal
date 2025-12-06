import { useAuth } from "@/features/Auth/useAuth";
import { InterviewQuizContextType, InterviewQuizProps, QuizStep } from "./types";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { useQuizCore } from "../useQuizCore";
import { db } from "@/features/Firebase/firebaseDb";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useEffect, useRef } from "react";
import { InterviewQuizSurvey } from "../../../types";
import { getDoc, setDoc } from "firebase/firestore";

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

  const currentStepData = quiz.steps.find((step) => step.id === core.currentStep) || null;

  const surveyDocRef = db.documents.interviewQuizSurvey(auth.uid, interviewId);
  const [surveyDoc] = useDocumentData(surveyDocRef);
  const surveyRef = useRef<InterviewQuizSurvey | null>(surveyDoc || null);
  surveyRef.current = surveyDoc || null;

  const updateSurvey = async (surveyDoc: InterviewQuizSurvey, label: string) => {
    if (!surveyDocRef) throw new Error("updateSurvey | No survey doc ref");
    const updatedSurvey: InterviewQuizSurvey = {
      ...surveyDoc,
      updatedAtIso: new Date().toISOString(),
    };
    await setDoc(surveyDocRef, updatedSurvey, { merge: true });
    console.log("✅ Survey doc updated: " + label);
    return updatedSurvey;
  };

  const ensureSurveyDocExists = async () => {
    if (surveyDoc) return;
    if (!surveyDocRef) throw new Error("ensureSurveyDocExists | No survey doc ref");
    if ((await getDoc(surveyDocRef)).data()) return;
    const initSurvey: InterviewQuizSurvey = {
      answers: {},
      updatedAtIso: new Date().toISOString(),
      createdAtIso: new Date().toISOString(),
    };
    await setDoc(surveyDocRef, initSurvey);
    console.log("✅ Survey doc created", initSurvey);
  };

  useEffect(() => {
    if (auth.uid) ensureSurveyDocExists();
  }, [auth.uid]);

  return {
    survey: surveyDoc || null,
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
    updateSurvey,
  };
}
