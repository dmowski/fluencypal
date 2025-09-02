"use client";
import { getUrlStart } from "@/features/Lang/getUrlStart";
import { SupportedLanguage, supportedLanguages } from "@/features/Lang/lang";
import { useUrlState } from "@/features/Url/useUrlParam";
import {
  useSignal,
  viewportContentSafeAreaInsetTop,
  viewportSafeAreaInsetTop,
  viewportContentSafeAreaInsetBottom,
  viewportSafeAreaInsetBottom,
} from "@telegram-apps/sdk-react";
import { useRouter } from "next/navigation";
import { createContext, useContext, ReactNode, JSX } from "react";
import { useLanguageGroup } from "../useLanguageGroup";
import { useLingui } from "@lingui/react";
import { getCountryByIP } from "@/features/User/getCountry";
import { countries } from "@/libs/countries";

type QuizStep = "learnLanguage" | "nativeLanguage" | "pageLanguage" | "recordAbout" | "reviewAbout";
const stepsViews: QuizStep[] = [
  "learnLanguage",
  "nativeLanguage",
  "pageLanguage",
  "recordAbout",
  "reviewAbout",
];

interface QuizContextType {
  languageToLearn: SupportedLanguage;
  setLanguageToLearn: (lang: SupportedLanguage) => void;
  pageLanguage: SupportedLanguage;
  setPageLanguage: (lang: SupportedLanguage) => void;
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
}

const QuizContext = createContext<QuizContextType | null>(null);

interface QuizProps {
  pageLang: SupportedLanguage;
  defaultLangToLearn: SupportedLanguage;
}
function useProvideQuizContext({ pageLang, defaultLangToLearn }: QuizProps): QuizContextType {
  const [languageToLearn, setLanguageToLearnState, isLanguageLoading] =
    useUrlState<SupportedLanguage>("toLearn", defaultLangToLearn, false);
  const [pageLanguage, setPageLanguage, isPageLanguageLoading] = useUrlState<SupportedLanguage>(
    "pageLang",
    pageLang,
    false
  );
  const [nativeLanguage, setNativeLanguageInput, isNativeLanguageLoading] = useUrlState<string>(
    "nativeLang",
    pageLang,
    false
  );

  const [currentStep, setStep, isStepLoading] = useUrlState<QuizStep>(
    "step",
    "learnLanguage",
    true
  );

  const { i18n } = useLingui();
  const { languageGroups } = useLanguageGroup({
    defaultGroupTitle: i18n._(`Other languages`),
    systemLanguagesTitle: i18n._(`System languages`),
  });

  const setLanguageToLearn = async (langToLearn: SupportedLanguage) => {
    setLanguageToLearnState(langToLearn);

    if (nativeLanguage !== langToLearn) {
      return;
    }

    const systemLanguages = languageGroups.filter(
      (group) => group.isSystemLanguage && group.code !== langToLearn
    );
    const goodSystemLang = systemLanguages[0]?.code;
    if (goodSystemLang) {
      setNativeLanguageInput(goodSystemLang);
      return;
    }

    const countryCode = await getCountryByIP();
    const country = countryCode ? languageGroups.find((lang) => lang.code === countryCode) : null;

    if (country) {
      setNativeLanguageInput(country.code);
      return;
    }

    setNativeLanguageInput("");
  };

  const setNativeLanguage = (lang: string) => {
    setNativeLanguageInput(lang);
  };

  const getPath = () => {
    const isNativeLanguageIsSupportedLanguage = (supportedLanguages as string[]).includes(
      nativeLanguage
    );

    const path = stepsViews.filter((viewStep) => {
      if (viewStep === "pageLanguage") {
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

  const nextStep = () => {
    const nextStepIndex = Math.min(currentStepIndex + 1, path.length - 1);
    const nextStep = path[nextStepIndex];
    // if
    setStep(nextStep);
  };

  const prevStep = () => {
    const prevStepIndex = Math.max(currentStepIndex - 1, 0);
    const prevStep = path[prevStepIndex];
    setStep(prevStep);
  };

  const router = useRouter();
  const navigateToMainPage = () => {
    const newPath = `${getUrlStart(pageLanguage)}`;
    router.push(newPath);
  };

  const progress = currentStepIndex / (path.length - 1) + 0.1;

  return {
    languageToLearn,
    pageLanguage,
    nativeLanguage,
    setLanguageToLearn,
    setPageLanguage,
    setNativeLanguage,
    navigateToMainPage,

    currentStep,
    isStepLoading,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === path.length - 1,
    nextStep,
    prevStep,
    progress,
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
