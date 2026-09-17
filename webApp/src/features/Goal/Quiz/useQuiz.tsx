'use client';
import { getLandingUrlStart } from '@/features/Lang/getUrlStart';
import { SupportedLanguage, supportedLanguages } from '@/features/Lang/lang';
import { SetUrlStateOptions, useUrlMapState } from '@/features/Url/useUrlParam';

import { useRouter } from 'next/navigation';
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
} from 'react';
import { useLanguageGroup } from '../useLanguageGroup';
import { useLingui } from '@lingui/react';
import { getCountryByIP } from '@/features/User/getCountry';
import { replaceUrlToLang } from '@/features/Lang/replaceLangInUrl';
import { getNativeLanguageQuizNextUrl } from './quizLocaleUrl';
import { isTMA } from '@telegram-apps/sdk-react';
import { scrollToLangButton } from '@/libs/scroll';
import { sleep } from '@/libs/sleep';
import { useAuth } from '@/features/Auth/useAuth';
import { db } from '@/features/Firebase/firebaseDb';
import { runWithFirestoreAuth } from '@/features/Firebase/runWithFirestoreAuth';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { getDoc, setDoc } from 'firebase/firestore';
import { QuizSurvey2, QuizSurvey2FollowUpQuestion } from './types';
import * as Sentry from '@sentry/nextjs';
import { useSettings } from '@/features/Settings/useSettings';
import { usePlan } from '@/features/Plan/usePlan';
import { useAiUserInfo } from '@/features/User/useAiUserInfo';
import { fnv1aHash } from '@/libs/hash';
import { NativeLangCode } from '@/libs/language/type';
import { guessLanguagesByCountry } from '@/libs/language/languageByCountry';
import {
  QuizGuestAboutRecording,
  transcribeAboutRecording,
  writeAboutTranscriptionToSurvey,
} from './quizGuestAboutStorage';
import { QuizStep, quizSteps, resolveQuizStep } from './quizSteps';

const getHash = (input: string) => {
  if (!input) return '';

  return fnv1aHash(input);
};

interface QuizContextType {
  languageToLearn: SupportedLanguage;
  setLanguageToLearn: (lang: SupportedLanguage) => void;
  pageLanguage: SupportedLanguage;
  setPageLanguage: (lang: SupportedLanguage) => Promise<void>;
  nativeLanguage: string;
  setNativeLanguage: (lang: NativeLangCode) => void;
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
  survey: QuizSurvey2 | null;
  updateSurvey: (surveyDoc: QuizSurvey2, label: string) => Promise<QuizSurvey2>;
  saveAboutClip: (recording: QuizGuestAboutRecording) => Promise<string>;

  test: () => Promise<void>;
  confirmPlan: () => Promise<void>;
  isGoalGenerating: boolean;
  path: QuizStep[];
}
const QuizContext = createContext<QuizContextType | null>(null);

interface QuizProps {
  pageLang: SupportedLanguage;
  defaultLangToLearn: SupportedLanguage;
}

interface QuizUrlState {
  learn: SupportedLanguage;
  nativeLang: NativeLangCode;
  pageLang: SupportedLanguage;
  currentStep: QuizStep;
}

function useProvideQuizContext({ pageLang }: QuizProps): QuizContextType {
  const auth = useAuth();
  const settings = useSettings();
  const plan = usePlan();
  const userInfo = useAiUserInfo();

  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const defaultState: QuizUrlState = useMemo(
    () => ({
      learn: 'en',
      nativeLang: pageLang,
      pageLang,
      currentStep: quizSteps[0],
    }),
    [],
  );

  const [stateInput, setStateInput, isStateLoading] = useUrlMapState(
    defaultState as unknown as Record<string, string>,
    false,
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
    async (partial: Partial<QuizUrlState>, options?: SetUrlStateOptions) => {
      return await setStateInput(partial as unknown as Record<string, string>, options);
    },
    [setStateInput],
  );

  const state = stateInput as unknown as QuizUrlState;
  const nativeLanguage = state.nativeLang;
  const currentStep = state.currentStep;
  const languageToLearn = state.learn;
  const pageLanguage = state.pageLang;

  const surveyDocRef = db.documents.quizSurvey2(auth.uid, languageToLearn);
  const [surveyDoc] = useDocumentData(surveyDocRef);
  const surveyRef = useRef<QuizSurvey2 | null>(surveyDoc || null);
  surveyRef.current = surveyDoc || null;

  const updateSurvey = async (surveyDoc: QuizSurvey2, label: string) => {
    if (!surveyDocRef) {
      throw new Error('updateSurvey | No survey doc ref');
    }
    const updatedSurvey: QuizSurvey2 = {
      ...surveyDoc,
      updatedAtIso: new Date().toISOString(),
    };
    await setDoc(surveyDocRef, updatedSurvey, { merge: true });
    surveyRef.current = updatedSurvey;
    console.log('✅ Survey doc updated: ' + label);
    return updatedSurvey;
  };

  const test = async () => {};

  const [isGoalGeneratingMap, setIsGoalGeneratingMap] = useState<Record<string, boolean>>({});
  const isGoalGenerating = Object.values(isGoalGeneratingMap).some((v) => v);

  const generateGoal = async () => {
    const survey = surveyRef.current;
    if (!survey) {
      return;
    }
    const about = (survey.aboutUserTranscription || '').trim();
    if (!about) {
      return;
    }

    const initialSurveyHash = getHash(about);
    if (initialSurveyHash === survey.goalHash) {
      console.log('⏩ generateGoal | Survey not changed');
      return;
    }

    setIsGoalGeneratingMap((prev) => ({ ...prev, [initialSurveyHash]: true }));
    try {
      const extractedRecordsRequest = userInfo.extractUserRecordsFromText?.(about);
      const goal = await plan.generateGoal({
        languageCode: languageToLearn,
        context: about,
      });
      const finalAbout = (surveyRef.current?.aboutUserTranscription || '').trim();
      const finalSurveyHash = getHash(finalAbout);
      if (initialSurveyHash !== finalSurveyHash) {
        console.log('🦄 generateGoal | Survey changed during goal generation, skipping update');
        return;
      }
      if (!surveyRef.current) {
        return;
      }
      await updateSurvey(
        {
          ...surveyRef.current,
          goalData: goal,
          goalHash: finalSurveyHash,
          advancedUserRecords: (await extractedRecordsRequest) || [],
        },
        'generateGoal',
      );
    } catch (error) {
      Sentry.captureException(error);
    } finally {
      setIsGoalGeneratingMap((prev) => ({ ...prev, [initialSurveyHash]: false }));
    }
  };

  const syncWithSettings = async (survey: QuizSurvey2) => {
    if (
      settings.userSettings?.languageCode !== survey.learningLanguageCode &&
      survey.learningLanguageCode
    ) {
      await settings.setLanguage(survey.learningLanguageCode);
    }

    if (
      settings.userSettings?.nativeLanguageCode !== survey.nativeLanguageCode &&
      survey.nativeLanguageCode
    ) {
      await settings.setNativeLanguage(survey.nativeLanguageCode);
    }

    if (
      settings.userSettings?.pageLanguageCode !== survey.pageLanguageCode &&
      survey.pageLanguageCode
    ) {
      await settings.setPageLanguage(survey.pageLanguageCode);
    }
  };

  const ensureSurveyDocExists = async () => {
    await runWithFirestoreAuth(auth.getToken, writeSurveyDocIfNeeded);
  };

  const writeSurveyDocIfNeeded = async () => {
    if (surveyDoc) {
      if (
        surveyDoc.learningLanguageCode !== languageToLearn ||
        surveyDoc.nativeLanguageCode !== nativeLanguage ||
        surveyDoc.pageLanguageCode !== pageLanguage
      ) {
        const survey = await updateSurvey(
          {
            ...surveyDoc,
            learningLanguageCode: languageToLearn,
            nativeLanguageCode: nativeLanguage,
            pageLanguageCode: pageLanguage,
          },
          'ensureSurveyDocExists',
        );

        await syncWithSettings(survey);
      }
      return;
    }
    if (!auth.uid) {
      console.warn('ensureSurveyDocExists | No auth uid, skipping survey doc creation');
      return;
    }

    if (!surveyDocRef) {
      console.error('ensureSurveyDocExists | No survey doc ref');
      return;
    }

    const doc = await getDoc(surveyDocRef);
    const docData = doc.data();
    if (!docData) {
      const initSurvey: QuizSurvey2 = {
        learningLanguageCode: languageToLearn,
        nativeLanguageCode: nativeLanguage,
        pageLanguageCode: pageLanguage,
        exampleOfWelcomeMessage: '',

        aboutUserTranscription: '',
        aboutUserFollowUpQuestion: {
          sourceTranscription: '',
          title: '',
          subtitle: '',
          description: '',
          hash: '',
        },
        aboutUserFollowUpTranscription: '',

        goalUserTranscription: '',
        goalFollowUpQuestion: {
          sourceTranscription: '',
          title: '',
          subtitle: '',
          description: '',
          hash: '',
        },

        goalData: null,
        goalHash: '',
        advancedUserRecords: userInfo.userInfo?.advancedRecords || [],

        updatedAtIso: new Date().toISOString(),
        createdAtIso: new Date().toISOString(),
      };
      await setDoc(surveyDocRef, initSurvey);
      surveyRef.current = initSurvey;
      await syncWithSettings(initSurvey);
      console.log('✅ Survey doc created', initSurvey);
    } else {
      const updatedSurvey = await updateSurvey(
        {
          ...docData,
          learningLanguageCode: languageToLearn,
          nativeLanguageCode: nativeLanguage,
          pageLanguageCode: pageLanguage,
        },
        'ensureSurveyDocExists',
      );
      await syncWithSettings(updatedSurvey);
    }
  };

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
        (group) => group.isSystemLanguage && group.languageCode !== langToLearn,
      );
      const goodSystemLang = systemLanguages[0]?.languageCode;
      if (goodSystemLang) {
        console.log('Found system lang', goodSystemLang);
        return {
          nativeLang: goodSystemLang,
        };
      }

      const countryCode = await getCountryByIP();
      const languagesByCountryCode: NativeLangCode[] = countryCode
        ? guessLanguagesByCountry(countryCode)
        : [];

      const filteredLanguagesCodes = languagesByCountryCode.filter((code) => code !== langToLearn);
      const languageByCountry = filteredLanguagesCodes.filter((code) =>
        languageGroups.find((lang) => lang.languageCode === code),
      )[0];

      if (languageByCountry) {
        console.log('Found country by IP', languageByCountry);
        return {
          nativeLang: languageByCountry,
        };
      }

      return {};
    } catch (e) {
      console.error(e);
      Sentry.captureException(e, {
        extra: {
          title: 'Error in preFindNativeLanguage',
        },
      });
    }

    return {};
  };

  const setLanguageToLearn = async (langToLearn: SupportedLanguage) => {
    const newPartialState: Partial<QuizUrlState> = {
      learn: langToLearn,
    };
    const updatedNativeLanguage = await preFindNativeLanguage(langToLearn);
    const newStatePatch: Partial<QuizUrlState> = {
      ...newPartialState,
      ...updatedNativeLanguage,
    };

    setState(newStatePatch);
  };

  const setNativeLanguage = (lang: NativeLangCode) => {
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

  const path = useMemo(() => {
    const isNativeLanguageIsSupportedLanguage = (supportedLanguages as string[]).includes(
      nativeLanguage,
    );

    return quizSteps.filter((viewStep) => {
      if (viewStep === 'pageLanguage' || viewStep === 'before_pageLanguage') {
        return !isNativeLanguageIsSupportedLanguage;
      }
      return true;
    });
  }, [nativeLanguage]);
  const activeStep = resolveQuizStep(currentStep, path);
  const currentStepIndex = path.indexOf(activeStep);

  const saveAboutClip = async (recording: QuizGuestAboutRecording) => {
    await ensureSurveyDocExists();
    const transcript = await transcribeAboutRecording({
      recording,
      getToken: auth.getToken,
    });
    if (!transcript) {
      throw new Error('Could not transcribe about recording');
    }

    const written = await writeAboutTranscriptionToSurvey({
      transcript,
      getSurvey: () => surveyRef.current,
      loadSurvey: async () => {
        if (!surveyDocRef) {
          return null;
        }
        const snap = await getDoc(surveyDocRef);
        return snap.data() ?? null;
      },
      updateSurvey,
    });
    if (!written) {
      throw new Error('Could not save about recording');
    }
    return written;
  };

  useEffect(() => {
    if (auth.loading || auth.isIdentified) {
      return;
    }
    void auth.ensureAnonymousAuth().catch((error) => {
      Sentry.captureException(error);
    });
  }, [auth.loading, auth.isIdentified, auth.ensureAnonymousAuth]);

  useEffect(() => {
    if (!auth.uid || !languageToLearn) {
      return;
    }
    if (settings.userSettings?.languageCode === languageToLearn) {
      return;
    }
    void settings.setLanguage(languageToLearn).catch((error) => {
      Sentry.captureException(error);
    });
  }, [auth.uid, languageToLearn, settings.userSettings?.languageCode, settings.setLanguage]);

  useEffect(() => {
    if (!auth.uid) {
      return;
    }
    if (activeStep !== 'before_recordAbout') {
      return;
    }

    void ensureSurveyDocExists().catch((error) => {
      Sentry.captureException(error);
    });
  }, [auth.uid, activeStep]);

  useEffect(() => {
    if (activeStep !== 'before_goalReview' && activeStep !== 'goalReview') {
      return;
    }
    void generateGoal();
  }, [surveyDoc, activeStep]);

  useEffect(() => {
    if (currentStep === activeStep) {
      return;
    }
    void setState({ currentStep: activeStep });
  }, [activeStep, currentStep, setState]);

  const nextStep = async () => {
    const nextStepIndex = Math.min(currentStepIndex + 1, path.length - 1);
    const nextStep = path[nextStepIndex];

    if (auth.uid && activeStep === 'before_recordAbout') {
      try {
        await ensureSurveyDocExists();
      } catch (error) {
        Sentry.captureException(error);
        return;
      }
    }

    let newStatePatch: Partial<QuizUrlState> = {
      currentStep: nextStep,
    };

    if (activeStep === 'learnLanguage') {
      const langPatch = await preFindNativeLanguage(languageToLearn);
      newStatePatch = {
        ...newStatePatch,
        ...langPatch,
      };
    }

    const localeRedirectUrl = getNativeLanguageQuizNextUrl({
      currentStep: activeStep,
      nativeLanguage,
      currentPageLang: pageLang,
      nextState: { ...state, ...newStatePatch } as unknown as Record<string, string>,
      defaultState: defaultState as unknown as Record<string, string>,
      pathname: window.location.pathname,
      search: window.location.search,
    });
    if (localeRedirectUrl) {
      window.location.assign(localeRedirectUrl);
      return;
    }

    const url = await setState(newStatePatch, {
      redirect: false,
    });
    router.push(url || '', { scroll: false });
  };

  const prevStep = useCallback(() => {
    const prevStepIndex = Math.max(currentStepIndex - 1, 0);
    const prevStep = path[prevStepIndex];
    void setState({ currentStep: prevStep });
  }, [currentStepIndex, path, setState]);

  const navigateToMainPage = () => {
    const newPath = `${getLandingUrlStart(pageLanguage)}`;
    router.push(newPath);
  };

  const progress = currentStepIndex / path.length + 0.1;

  const confirmPlan = async () => {
    if (!surveyRef.current?.goalData) {
      alert('Please complete the goal before confirming your plan.');
      return;
    }

    if (surveyDoc?.advancedUserRecords) {
      await userInfo.updateAllRecords(surveyDoc?.advancedUserRecords);
    }

    await plan.addGoalPlan(surveyRef.current.goalData);
  };

  return {
    survey: surveyDoc || null,
    confirmPlan,
    languageToLearn,
    pageLanguage,
    nativeLanguage,
    setLanguageToLearn,
    setPageLanguage,
    setNativeLanguage,
    navigateToMainPage,

    isCanGoToMainPage,

    currentStep: activeStep,
    isStepLoading: isStateLoading,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === path.length - 1,
    nextStep,
    prevStep,
    progress,
    isFirstLoading,
    updateSurvey,
    saveAboutClip,
    test,
    isGoalGenerating,
    path,
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
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
