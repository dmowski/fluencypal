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
} from "react";
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
import { getDoc, setDoc } from "firebase/firestore";
import { QuizSurvey2, QuizSurvey2FollowUpQuestion } from "./types";
import * as Sentry from "@sentry/nextjs";
import { useTextAi } from "@/features/Ai/useTextAi";
import { useFixJson } from "@/features/Ai/useFixJson";
import { useSettings } from "@/features/Settings/useSettings";
import { usePlan } from "@/features/Plan/usePlan";
import { ChatMessage } from "@/common/conversation";
import { useAiUserInfo } from "@/features/Ai/useAiUserInfo";
import { fnv1aHash } from "@/libs/hash";
import { getWordsCount } from "@/libs/words";

type QuizStep =
  | "before_nativeLanguage"
  | "learnLanguage"
  | "nativeLanguage"
  | "before_pageLanguage"
  | "pageLanguage"
  | "before_recordAbout"
  | "recordAbout"
  | "before_recordAboutFollowUp"
  | "recordAboutFollowUp"
  | "before_recordAboutFollowUp2"
  | "recordAboutFollowUp2"
  | "reviewAbout"
  | "before_goalReview"
  | "goalReview";
const stepsViews: QuizStep[] = [
  "learnLanguage",
  "before_nativeLanguage",
  "nativeLanguage",

  "before_pageLanguage",
  "pageLanguage",

  "before_recordAbout",
  "recordAbout",

  "before_recordAboutFollowUp",
  "recordAboutFollowUp",

  "before_recordAboutFollowUp2",
  "recordAboutFollowUp2",

  "before_goalReview",
  "goalReview",
];

export const MIN_WORDS_FOR_ANSWER = 50;

const getSurveyHash = (survey: QuizSurvey2 | null) => {
  if (!survey) return "";

  return [
    survey.aboutUserTranscription,
    survey.aboutUserFollowUpTranscription,
    survey.goalUserTranscription,
  ].join("||");

  /*return fnv1aHash(
    [
      survey.aboutUserTranscription,

      survey.aboutUserFollowUpQuestion.title,
      survey.aboutUserFollowUpTranscription,

      survey.goalFollowUpQuestion.title,
      survey.goalUserTranscription,
    ].join("||")
  );*/
};

const isAboutRecorded = (survey: QuizSurvey2) => {
  const transcript = survey.aboutUserTranscription || "";
  const wordsCount = getWordsCount(transcript);
  return wordsCount >= MIN_WORDS_FOR_ANSWER;
};

const isAboutFollowUpRecord = (survey: QuizSurvey2) => {
  const transcript = survey.aboutUserFollowUpTranscription || "";
  const wordsCount = getWordsCount(transcript);
  return wordsCount >= MIN_WORDS_FOR_ANSWER;
};

const isGoalIsRecorded = (survey: QuizSurvey2) => {
  const transcript = survey.goalUserTranscription || "";
  const wordsCount = getWordsCount(transcript);
  return wordsCount >= MIN_WORDS_FOR_ANSWER;
};

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
  survey: QuizSurvey2 | null;
  updateSurvey: (surveyDoc: QuizSurvey2, label: string) => Promise<QuizSurvey2>;

  test: () => Promise<void>;
  confirmPlan: () => Promise<void>;
  isGoalGenerating: boolean;
}
const QuizContext = createContext<QuizContextType | null>(null);

interface QuizProps {
  pageLang: SupportedLanguage;
  defaultLangToLearn: SupportedLanguage;
}

interface QuizUrlState {
  learn: SupportedLanguage;
  nativeLang: string;
  pageLang: SupportedLanguage;
  currentStep: QuizStep;
}

function useProvideQuizContext({ pageLang, defaultLangToLearn }: QuizProps): QuizContextType {
  const auth = useAuth();
  const textAi = useTextAi();
  const fixJson = useFixJson();
  const settings = useSettings();
  const plan = usePlan();
  const userInfo = useAiUserInfo();

  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const defaultState: QuizUrlState = useMemo(
    () => ({
      learn: "en",
      nativeLang: pageLang,
      pageLang,
      currentStep: stepsViews[0],
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

  const setState = async (partial: Partial<QuizUrlState>, options?: SetUrlStateOptions) => {
    return await setStateInput(partial as unknown as Record<string, string>, options);
  };

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
      throw new Error("updateSurvey | No survey doc ref");
    }
    const updatedSurvey: QuizSurvey2 = { ...surveyDoc, updatedAtIso: new Date().toISOString() };
    await setDoc(surveyDocRef, updatedSurvey, { merge: true });
    console.log("✅ Survey doc updated: " + label);
    return updatedSurvey;
  };

  const userAboutRef = useRef("");
  const [isGeneratingFollowUpMap, setIsGeneratingFollowUpMap] = useState<Record<string, boolean>>(
    {}
  );
  userAboutRef.current = surveyDoc?.aboutUserTranscription || "";
  const [generatingFollowUpAttempts, setGeneratingFollowUpAttempts] = useState(0);

  const processAbout = async (survey: QuizSurvey2): Promise<QuizSurvey2FollowUpQuestion> => {
    const learningLanguageFullName = fullLanguageName[survey.learningLanguageCode];
    const systemMessage = `You are an expert in ${learningLanguageFullName} language learning and helping people set effective language learning goals. Your task is to analyze a user's description of themselves then generate a follow-up question that encourages deeper reflection and provides additional context to help clarify their objectives.
The follow-up question should be open-ended and thought-provoking, designed to elicit more detailed responses. Additionally, provide a brief explanation of why this question is important for understanding the user's motivations and goals. Use user's language, because sometime user cannot understand ${learningLanguageFullName} well.

Respond in JSON format with the following structure:
{
  "question": "A concise follow-up question to user. 1 short sentence. Less than 8 words",
  "subTitle": "A brief subtitle that provides context for user. 1 sentence",
  "description": "A short description explaining user the importance of the question. 2 sentences"
}

Ensure that the JSON is properly formatted and can be easily parsed.
Do not include any additional text outside of the JSON structure. 

Start response with symbol '{' and end with '}'. Your response will be parsed with js JSON.parse()
`;

    const aiResult = await textAi.generate({
      systemMessage,
      userMessage: survey.aboutUserTranscription,
      model: "gpt-4o",
      languageCode: survey.pageLanguageCode || "en",
    });

    const parsedResult = await fixJson.parseJson<{
      question: string;
      subTitle: string;
      description?: string;
    }>(aiResult);

    const newAnswer: QuizSurvey2FollowUpQuestion = {
      sourceTranscription: survey.aboutUserTranscription,
      title: parsedResult.question,
      subtitle: parsedResult.subTitle,
      description: parsedResult.description || "",
      hash: getSurveyHash(survey),
    };

    return newAnswer;
  };

  const test = async () => {};

  const analyzeUserAbout = async (survey: QuizSurvey2) => {
    if (!isAboutRecorded(survey)) {
      return;
    }

    setGeneratingFollowUpAttempts((v) => v + 1);

    if (generatingFollowUpAttempts > 0 && generatingFollowUpAttempts % 10 === 0) {
      console.log(
        `⏩ analyzeUserAbout | attempt: ${generatingFollowUpAttempts} | Too many attempts, Waiting before analysis`
      );
      await sleep(10_000);
    }

    if (generatingFollowUpAttempts > 50) {
      console.log(
        `⏩ analyzeUserAbout | attempt: ${generatingFollowUpAttempts} | Too many attempts, stopping analysis`
      );
      return;
    }

    const initHash = getSurveyHash(survey);

    if (initHash === survey.aboutUserFollowUpQuestion.hash) {
      console.log("⏩ analyzeUserAbout | Goal followup already generated, skipping");
      return;
    }

    if (isGeneratingFollowUpMap[initHash]) {
      console.log("⏩ analyzeUserAbout | Goal followup already in progress, skipping");
      return;
    }

    setIsGeneratingFollowUpMap((prev) => ({ ...prev, [initHash]: true }));

    try {
      console.log("🦄 analyzeUserAbout ");
      const newAnswer = await processAbout(survey);

      const afterHash = getSurveyHash(surveyRef.current);

      if (afterHash !== initHash) {
        console.log("⏩ analyzeUserAbout | User about changed, skipping analysis");
        setIsGeneratingFollowUpMap((prev) => ({ ...prev, [initHash]: false }));
        return;
      }

      await updateSurvey(
        {
          ...survey,
          aboutUserFollowUpQuestion: newAnswer,
        },
        "analyzeUserAbout"
      );
      setIsGeneratingFollowUpMap((prev) => ({ ...prev, [initHash]: false }));
    } catch (e) {
      console.error("❌ analyzeUserAbout | Error during analysis", e);
      Sentry.captureException(e, {
        extra: {
          title: "Error in analyzeUserAbout",
          text: survey.aboutUserFollowUpTranscription,
          survey,
        },
      });

      setIsGeneratingFollowUpMap((prev) => ({ ...prev, [initHash]: false }));
      await sleep(10_000);
      await analyzeUserAbout(survey);
    }
  };

  useEffect(() => {
    if (surveyDoc) {
      analyzeUserAbout(surveyDoc);
    }
  }, [surveyDoc]);

  const [isGeneratingGoalFollowUpMap, setIsGeneratingGoalFollowUpMap] = useState<
    Record<string, boolean>
  >({});
  const [generatingGoalFollowUpAttempts, setGeneratingGoalFollowUpAttempts] = useState(0);

  const processAboutFollowUp = async (
    survey: QuizSurvey2
  ): Promise<QuizSurvey2FollowUpQuestion> => {
    const hash = getSurveyHash(survey);
    const learningLanguageFullName = fullLanguageName[survey.learningLanguageCode];
    const systemMessage = `You are an expert in ${learningLanguageFullName} language learning and helping people set effective language learning goals. Your task is to analyze a user's description of themselves and their answer to question then generate a follow-up question that encourages deeper reflection and provides additional context to help clarify their objectives.
The follow-up question should be open-ended and thought-provoking, designed to elicit more detailed responses. Additionally, provide a brief explanation of why this question is important for understanding the user's motivations and goals. Use user's language, because sometime user cannot understand ${learningLanguageFullName} well.

Respond in JSON format with the following structure:
{
  "question": "A concise follow-up question to user. 1 short sentence. Less than 8 words",
  "subTitle": "A brief subtitle that provides context for user. 1 sentence",
  "description": "A short description explaining user the importance of the question. 2 sentences"
}

Ensure that the JSON is properly formatted and can be easily parsed.
Do not include any additional text outside of the JSON structure. 

Start response with symbol '{' and end with '}'. Your response will be parsed with js JSON.parse()
`;

    const aiResult = await textAi.generate({
      systemMessage,
      userMessage: `
About User:
${survey.aboutUserTranscription}

---

Follow-up question to user:
${survey.aboutUserFollowUpQuestion.title} (${survey.aboutUserFollowUpQuestion.description})

${survey.aboutUserFollowUpTranscription}
`,
      model: "gpt-4o",
      languageCode: survey.pageLanguageCode || "en",
    });

    const parsedResult = await fixJson.parseJson<{
      question: string;
      subTitle: string;
      description?: string;
    }>(aiResult);

    const newAnswer: QuizSurvey2FollowUpQuestion = {
      sourceTranscription: survey.aboutUserFollowUpTranscription,
      title: parsedResult.question,
      subtitle: parsedResult.subTitle,
      description: parsedResult.description || "",
      hash,
    };

    return newAnswer;
  };

  const analyzeUserFollowUpAbout = async (survey: QuizSurvey2) => {
    if (!isAboutRecorded(survey) || !isAboutFollowUpRecord(survey)) {
      return;
    }

    setGeneratingGoalFollowUpAttempts((v) => v + 1);

    if (generatingGoalFollowUpAttempts > 0 && generatingGoalFollowUpAttempts % 10 === 0) {
      console.log(
        `⏩ analyzeUserFollowUpAbout | attempt: ${generatingGoalFollowUpAttempts} | Too many attempts, Waiting before analysis`
      );
      await sleep(10_000);
    }

    if (generatingGoalFollowUpAttempts > 50) {
      console.log(
        `⏩ analyzeUserFollowUpAbout | attempt: ${generatingGoalFollowUpAttempts} | Too many attempts, stopping analysis`
      );
      return;
    }

    const initHash = getSurveyHash(survey);

    if (initHash === survey.goalFollowUpQuestion.hash) {
      console.log(`⏩ analyzeUserFollowUpAbout | Goal followup already generated, skipping`);
      return;
    }

    if (isGeneratingGoalFollowUpMap[initHash]) {
      console.log(`⏩ analyzeUserFollowUpAbout | Goal followup already in progress, skipping`);
      return;
    }

    console.log(`🦄 analyzeUserFollowUpAbout | Starting analysis for text length`);
    setIsGeneratingGoalFollowUpMap((prev) => ({ ...prev, [initHash]: true }));

    try {
      const newGoalQuestion = await processAboutFollowUp(survey);

      const afterHash = getSurveyHash(surveyRef.current);

      if (afterHash !== initHash) {
        console.log(`⏩ analyzeUserFollowUpAbout | User about followup changed, skipping analysis`);
        setIsGeneratingGoalFollowUpMap((prev) => ({ ...prev, [initHash]: false }));
        return;
      }

      await updateSurvey(
        {
          ...(surveyRef.current || survey),
          goalFollowUpQuestion: newGoalQuestion,
        },
        "analyzeUserFollowUpAbout"
      );
      setIsGeneratingGoalFollowUpMap((prev) => ({ ...prev, [initHash]: false }));
      return;
    } catch (e) {
      console.error("❌ analyzeUserFollowUpAbout | Error during analysis", e);
      Sentry.captureException(e, {
        extra: {
          title: "Error in analyzeUserFollowUpAbout",
          text: survey.aboutUserFollowUpTranscription,
          survey,
        },
      });
      setIsGeneratingGoalFollowUpMap((prev) => ({ ...prev, [initHash]: false }));
      await sleep(3_000);

      await analyzeUserFollowUpAbout(survey);
    }
  };

  useEffect(() => {
    if (surveyDoc) {
      analyzeUserFollowUpAbout(surveyDoc);
    }
  }, [surveyDoc]);

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
          "ensureSurveyDocExists"
        );

        await syncWithSettings(survey);
      }
      return;
    }
    if (!auth.uid) {
      throw new Error("ensureSurveyDocExists | No auth uid");
    }

    if (!surveyDocRef) {
      throw new Error("ensureSurveyDocExists | No survey doc ref");
    }

    const doc = await getDoc(surveyDocRef);
    const docData = doc.data();
    if (!docData) {
      const initSurvey: QuizSurvey2 = {
        learningLanguageCode: languageToLearn,
        nativeLanguageCode: nativeLanguage,
        pageLanguageCode: pageLanguage,

        aboutUserTranscription: "",
        aboutUserFollowUpQuestion: {
          sourceTranscription: "",
          title: "",
          subtitle: "",
          description: "",
          hash: "",
        },
        aboutUserFollowUpTranscription: "",

        goalUserTranscription: "",
        goalFollowUpQuestion: {
          sourceTranscription: "",
          title: "",
          subtitle: "",
          description: "",
          hash: "",
        },

        goalData: null,
        goalHash: "",
        userRecords: userInfo.userInfo?.records || [],

        updatedAtIso: new Date().toISOString(),
        createdAtIso: new Date().toISOString(),
      };
      await setDoc(surveyDocRef, initSurvey);
      await syncWithSettings(initSurvey);
      console.log("✅ Survey doc created", initSurvey);
    } else {
      const updatedSurvey = await updateSurvey(
        {
          ...docData,
          learningLanguageCode: languageToLearn,
          nativeLanguageCode: nativeLanguage,
          pageLanguageCode: pageLanguage,
        },
        "ensureSurveyDocExists"
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
      Sentry.captureException(e, {
        extra: {
          title: "Error in preFindNativeLanguage",
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

    if (currentStep === "before_recordAbout") {
      ensureSurveyDocExists();
    }

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

  const [isGoalGeneratingMap, setIsGoalGeneratingMap] = useState<Record<string, boolean>>({});
  const isGoalGenerating = Object.values(isGoalGeneratingMap).some((v) => v);

  const generateGoal = async () => {
    const survey = surveyRef.current;
    if (!survey) {
      return;
    }

    const isReadyToGenerateGoal = isGoalIsRecorded(survey);
    if (!isReadyToGenerateGoal) {
      console.log("⏩ generateGoal | not ready");
      return;
    }

    const initialSurveyHash = getSurveyHash(survey);
    if (initialSurveyHash === survey.goalHash) {
      console.log("⏩ generateGoal | Survey not changed");
      return;
    }

    setIsGoalGeneratingMap((prev) => ({ ...prev, [initialSurveyHash]: true }));
    const conversationMessages: ChatMessage[] = [
      {
        id: `about_user`,
        isBot: false,
        text: `${survey.aboutUserTranscription}`,
      },
      {
        id: `about_user_followup_question`,
        isBot: true,
        text: `${survey.aboutUserFollowUpQuestion.title}\n${survey.aboutUserFollowUpQuestion.description || ""}`,
      },
      {
        id: `about_user_followup_answer`,
        isBot: false,
        text: `${survey.aboutUserFollowUpTranscription || "No answer provided"}`,
      },
      {
        id: `goal_followup_question`,
        isBot: true,
        text: `${survey.goalFollowUpQuestion.title}\n${survey.goalFollowUpQuestion.description || ""}`,
      },
      {
        id: `goal_followup_answer`,
        isBot: false,
        text: `${survey.goalUserTranscription || "No answer provided"}`,
      },
    ];

    console.log("🦄 generateGoal | Starting goal generation.");
    const userRecords = await userInfo.extractUserRecords(conversationMessages, languageToLearn);
    const goal = await plan.generateGoal({
      languageCode: languageToLearn,
      conversationMessages: conversationMessages,
      userInfo: userRecords,
    });

    setIsGoalGeneratingMap((prev) => ({ ...prev, [initialSurveyHash]: false }));

    const finalSurveyHash = getSurveyHash(surveyRef.current!);
    if (initialSurveyHash !== finalSurveyHash) {
      console.log("🦄 generateGoal | Survey changed during goal generation, skipping update");
      return;
    }
    if (!surveyRef.current) return;
    await updateSurvey(
      {
        ...surveyRef.current,
        goalData: goal,
        goalHash: finalSurveyHash,
        userRecords: userRecords,
      },
      "generateGoal"
    );
  };

  // Create effect to generate goals
  useEffect(() => {
    generateGoal();
  }, [surveyDoc]);

  const confirmPlan = async () => {
    if (!surveyRef.current?.goalData) {
      alert("Please complete the goal before confirming your plan.");
      return;
    }

    if (surveyDoc?.userRecords) {
      await userInfo.saveUserInfo(surveyDoc.userRecords);
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

    currentStep,
    isStepLoading: isStateLoading,
    isFirstStep: currentStepIndex === 0,
    isLastStep: currentStepIndex === path.length - 1,
    nextStep,
    prevStep,
    progress,
    isFirstLoading,
    updateSurvey,
    test,
    isGoalGenerating,
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
