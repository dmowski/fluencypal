"use client";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { fullLanguageName, SupportedLanguage, supportedLanguages } from "@/features/Lang/lang";
import { SetUrlStateOptions, useUrlMapState } from "@/features/Url/useUrlParam";

import { useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  ReactNode,
  JSX,
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useLingui } from "@lingui/react";
import { getCountryByIP } from "@/features/User/getCountry";
import { replaceUrlToLang } from "@/features/Lang/replaceLangInUrl";
import { isTMA } from "@telegram-apps/sdk-react";
import { scrollToLangButton } from "@/libs/scroll";
import { sleep } from "@/libs/sleep";
import { useAuth } from "@/features/Auth/useAuth";
import { db } from "@/features/Firebase/firebaseDb";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { getDoc, setDoc } from "firebase/firestore";
import * as Sentry from "@sentry/nextjs";
import { useTextAi } from "@/features/Ai/useTextAi";
import { useSettings } from "@/features/Settings/useSettings";
import { usePlan } from "@/features/Plan/usePlan";
import { ChatMessage } from "@/common/conversation";
import { useAiUserInfo } from "@/features/Ai/useAiUserInfo";
import { fnv1aHash } from "@/libs/hash";
import { getWordsCount } from "@/libs/words";
import { NativeLangCode } from "@/libs/language/type";
import { guessLanguagesByCountry } from "@/libs/language/languageByCountry";
import { useLanguageGroup } from "@/features/Goal/useLanguageGroup";
import { InterviewCoreData, InterviewQuiz, InterviewQuizStep, InterviewQuizSurvey } from "../types";

type QuizStep = string;

export const MIN_WORDS_FOR_ANSWER = 30;

interface InterviewQuizContextType {
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
const QuizContext = createContext<InterviewQuizContextType | null>(null);

interface InterviewQuizProps {
  coreData: InterviewCoreData;
  quiz: InterviewQuiz;
  lang: SupportedLanguage;
  interviewId: string;
}

interface InterviewQuizUrlState {
  currentStep: QuizStep;
}

function useProvideInterviewQuizContext({
  coreData,
  quiz,
  lang,
  interviewId,
}: InterviewQuizProps): InterviewQuizContextType {
  const auth = useAuth();
  const textAi = useTextAi();
  const settings = useSettings();
  const plan = usePlan();
  const userInfo = useAiUserInfo();

  const mainPageUrl = getUrlStart(lang) + `interview/${interviewId}`;

  const path: QuizStep[] = quiz.steps.map((step) => step.id);

  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const defaultState: InterviewQuizUrlState = useMemo(
    () => ({
      currentStep: path[0],
    }),
    []
  );

  const [stateInput, setStateInput, isStateLoading] = useUrlMapState(
    defaultState as unknown as Record<string, string>,
    false
  );

  useEffect(() => {
    if (!isStateLoading && isFirstLoading) {
      setIsFirstLoading(false);
    }
  }, [isStateLoading]);

  const isTelegramApp = useMemo(() => isTMA(), []);
  const isCanGoToMainPage = !isTelegramApp;

  const router = useRouter();

  const setState = useCallback(
    async (partial: Partial<InterviewQuizUrlState>, options?: SetUrlStateOptions) => {
      return await setStateInput(partial as unknown as Record<string, string>, options);
    },
    [setStateInput]
  );

  const state = stateInput as unknown as InterviewQuizUrlState;
  const currentStep = state.currentStep;
  const currentStepData = quiz.steps.find((step) => step.id === currentStep) || null;
  const currentStepIndex = path.indexOf(currentStep) > -1 ? path.indexOf(currentStep) : 0;

  const surveyDocRef = db.documents.interviewQuizSurvey(auth.uid, interviewId);
  const [surveyDoc] = useDocumentData(surveyDocRef);
  const surveyRef = useRef<InterviewQuizSurvey | null>(surveyDoc || null);
  surveyRef.current = surveyDoc || null;

  const updateSurvey = async (surveyDoc: InterviewQuizSurvey, label: string) => {
    if (!surveyDocRef) {
      throw new Error("updateSurvey | No survey doc ref");
    }
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
    if (auth.uid) {
      ensureSurveyDocExists();
    }
  }, [auth.uid]);

  const nextStep = async () => {
    const nextStepIndex = Math.min(currentStepIndex + 1, path.length - 1);
    const nextStep = path[nextStepIndex];

    let newStatePatch: Partial<InterviewQuizUrlState> = {
      currentStep: nextStep,
    };

    let url = await setState(newStatePatch, {
      redirect: false,
    });

    router.push(url || "", { scroll: false });
  };

  const prevStep = useCallback(() => {
    const prevStepIndex = Math.max(currentStepIndex - 1, 0);
    const prevStep = path[prevStepIndex];
    setState({ currentStep: prevStep });
  }, [currentStepIndex, path, setState]);

  const navigateToMainPage = () => {
    router.push(`${mainPageUrl}`);
  };

  const progress = currentStepIndex / path.length + 0.1;

  const confirmPlan = async () => {};

  return {
    survey: surveyDoc || null,
    isCanGoToMainPage,
    currentStep: currentStepData,
    isStepLoading: isStateLoading,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === path.length - 1,
    nextStep,
    navigateToMainPage,
    prevStep,
    progress,
    isFirstLoading,
    updateSurvey,
  };
}

export function InterviewQuizProvider({
  interviewId,
  children,
  lang,
  coreData,
  quiz,
}: {
  interviewId: string;
  children: ReactNode;
  lang: SupportedLanguage;
  coreData: InterviewCoreData;
  quiz: InterviewQuiz;
}): JSX.Element {
  const hook = useProvideInterviewQuizContext({ lang, coreData, quiz, interviewId });
  return <QuizContext.Provider value={hook}>{children}</QuizContext.Provider>;
}

export const useInterviewQuiz = (): InterviewQuizContextType => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useInterviewQuiz must be used within a InterviewQuizProvider");
  }
  return context;
};
