"use client";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { SupportedLanguage, supportedLanguages } from "@/features/Lang/lang";
import { SetUrlStateOptions, useUrlMapState } from "@/features/Url/useUrlParam";

import { useRouter } from "next/navigation";
import { createContext, useContext, ReactNode, JSX, useMemo, useState, useEffect } from "react";
import { useLanguageGroup } from "../useLanguageGroup";
import { useLingui } from "@lingui/react";
import { getCountryByIP } from "@/features/User/getCountry";
import { replaceUrlToLang } from "@/features/Lang/replaceLangInUrl";
import { isTMA } from "@telegram-apps/sdk-react";
import { scrollToLangButton } from "@/libs/scroll";
import { sleep } from "@/libs/sleep";
import { useAuth } from "@/features/Auth/useAuth";
import { db } from "@/features/Firebase/firebaseDb";
import { useDocumentData } from "react-firebase-hooks/firestore";

type QuizStep =
  | "before_nativeLanguage"
  | "learnLanguage"
  | "nativeLanguage"
  | "before_pageLanguage"
  | "pageLanguage"
  | "before_recordAbout"
  | "recordAbout"
  | "reviewAbout";
const stepsViews: QuizStep[] = [
  "learnLanguage",
  "before_nativeLanguage",
  "nativeLanguage",

  "before_pageLanguage",
  "pageLanguage",

  "before_recordAbout",
  "recordAbout",
  "reviewAbout",
];

interface QuizContextType {
  languageToLearn: SupportedLanguage;
  setLanguageToLearn: (lang: SupportedLanguage) => void;
  pageLanguage: SupportedLanguage;
  setPageLanguage: (lang: SupportedLanguage) => Promise<void>;
  nativeLanguage: string;
  setNativeLanguage: (lang: string) => void;
  navigateToMainPage: () => void;

  currentStep: QuizStep;
  isStepLoading: boolean;

  nextStep: () => void;
  prevStep: () => void;
  progress: number;
  isFirstStep: boolean;
  isLastStep: boolean;

  isCanGoToMainPage: boolean;
  isFirstLoading: boolean;
}
const QuizContext = createContext<QuizContextType | null>(null);

interface QuizProps {
  pageLang: SupportedLanguage;
  defaultLangToLearn: SupportedLanguage;
}

interface QuizUrlState {
  toLearn: SupportedLanguage;
  nativeLang: string;
  pageLang: SupportedLanguage;
  currentStep: QuizStep;
}

function useProvideQuizContext({ pageLang, defaultLangToLearn }: QuizProps): QuizContextType {
  const auth = useAuth();

  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const defaultState: QuizUrlState = useMemo(
    () => ({
      toLearn: defaultLangToLearn,
      nativeLang: pageLang,
      pageLang,
      currentStep: stepsViews[0],
    }),
    [defaultLangToLearn, pageLang]
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

  const setState = async (partial: Partial<QuizUrlState>, options?: SetUrlStateOptions) => {
    return await setStateInput(partial as unknown as Record<string, string>, options);
  };

  const state = stateInput as unknown as QuizUrlState;
  const nativeLanguage = state.nativeLang;
  const currentStep = state.currentStep;
  const languageToLearn = state.toLearn;
  const pageLanguage = state.pageLang;

  const surveyDocRef = db.documents.quizSurvey2(auth.uid, languageToLearn);
  const [surveyDoc, surveyLoading, error] = useDocumentData(surveyDocRef);

  const { i18n } = useLingui();
  const { languageGroups } = useLanguageGroup({
    defaultGroupTitle: i18n._(`Other languages`),
    systemLanguagesTitle: i18n._(`System languages`),
  });

  const preFindNativeLanguage = async (langToLearn: string): Promise<Partial<QuizUrlState>> => {
    try {
      if (nativeLanguage !== langToLearn) {
        return {};
      }

      const systemLanguages = languageGroups.filter(
        (group) => group.isSystemLanguage && group.code !== langToLearn
      );
      const goodSystemLang = systemLanguages[0]?.code;
      if (goodSystemLang) {
        console.log("Found system lang", goodSystemLang);
        return {
          nativeLang: goodSystemLang,
        };
      }

      const countryCode = await getCountryByIP();
      const country =
        countryCode && countryCode !== langToLearn
          ? languageGroups.find((lang) => lang.code === countryCode)
          : null;

      if (country) {
        console.log("Found country by IP", country.code);
        return {
          nativeLang: country.code,
        };
      }

      return {
        nativeLang: "",
      };
    } catch (e) {
      console.error(e);
    }

    return {};
  };

  const setLanguageToLearn = async (langToLearn: SupportedLanguage) => {
    const newPartialState: Partial<QuizUrlState> = {
      toLearn: langToLearn,
    };
    const updatedNativeLanguage = await preFindNativeLanguage(langToLearn);
    const newStatePatch: Partial<QuizUrlState> = {
      ...newPartialState,
      ...updatedNativeLanguage,
    };

    setState(newStatePatch);
  };

  const setNativeLanguage = (lang: string) => {
    const newStatePatch: Partial<QuizUrlState> = {
      nativeLang: lang,
    };
    setState(newStatePatch);
  };

  const setPageLanguage = async (lang: SupportedLanguage) => {
    const newStatePatch: Partial<QuizUrlState> = {
      pageLang: lang,
    };
    const updatedUrl = await setState(newStatePatch, { redirect: false });

    if (updatedUrl) {
      scrollToLangButton(lang);

      const urlToRedirect = replaceUrlToLang(lang, updatedUrl);
      router.push(urlToRedirect, { scroll: false });
      scrollToLangButton(lang);
      await sleep(300);
      scrollToLangButton(lang);
    }
  };

  const getPath = () => {
    const isNativeLanguageIsSupportedLanguage = (supportedLanguages as string[]).includes(
      nativeLanguage
    );

    const path = stepsViews.filter((viewStep) => {
      if (viewStep === "pageLanguage" || viewStep === "before_pageLanguage") {
        if (isNativeLanguageIsSupportedLanguage) {
          return false;
        } else {
          return true;
        }
      }

      return true;
    });

    return path;
  };

  const path = getPath();
  const currentStepIndex = path.indexOf(currentStep) === -1 ? 0 : path.indexOf(currentStep);

  const nextStep = async () => {
    const nextStepIndex = Math.min(currentStepIndex + 1, path.length - 1);
    const nextStep = path[nextStepIndex];

    let newStatePatch: Partial<QuizUrlState> = {
      currentStep: nextStep,
    };

    if (currentStep === "learnLanguage") {
      const langPatch = await preFindNativeLanguage(languageToLearn);
      newStatePatch = {
        ...newStatePatch,
        ...langPatch,
      };
    }
    let url = await setState(newStatePatch, {
      redirect: false,
    });

    if (url && currentStep === "nativeLanguage") {
      const isNativeLanguageIsSupportedLanguage = (supportedLanguages as string[]).includes(
        nativeLanguage
      );
      if (isNativeLanguageIsSupportedLanguage && pageLang !== nativeLanguage) {
        url = replaceUrlToLang(nativeLanguage, url);
      }
    }

    router.push(url || "", { scroll: false });
  };

  const prevStep = () => {
    const prevStepIndex = Math.max(currentStepIndex - 1, 0);
    const prevStep = path[prevStepIndex];
    setState({ currentStep: prevStep });
  };

  const navigateToMainPage = () => {
    const newPath = `${getUrlStart(pageLanguage)}`;
    router.push(newPath);
  };

  const progress = currentStepIndex / path.length + 0.1;

  return {
    languageToLearn,
    pageLanguage,
    nativeLanguage,
    setLanguageToLearn,
    setPageLanguage,
    setNativeLanguage,
    navigateToMainPage,

    isCanGoToMainPage,

    currentStep,
    isStepLoading: isStateLoading,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === path.length - 1,
    nextStep,
    prevStep,
    progress,
    isFirstLoading,
  };
}

export function QuizProvider({
  children,
  pageLang,
  defaultLangToLearn,
}: {
  children: ReactNode;
  pageLang: SupportedLanguage;
  defaultLangToLearn: SupportedLanguage;
}): JSX.Element {
  const hook = useProvideQuizContext({ pageLang, defaultLangToLearn });
  return <QuizContext.Provider value={hook}>{children}</QuizContext.Provider>;
}

export const useQuiz = (): QuizContextType => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
};
