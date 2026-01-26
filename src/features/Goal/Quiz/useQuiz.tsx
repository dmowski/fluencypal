'use client';
import { getUrlStart } from '@/features/Lang/getUrlStart';
import { fullLanguageName, SupportedLanguage, supportedLanguages } from '@/features/Lang/lang';
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
import { isTMA } from '@telegram-apps/sdk-react';
import { scrollToLangButton } from '@/libs/scroll';
import { sleep } from '@/libs/sleep';
import { useAuth } from '@/features/Auth/useAuth';
import { db } from '@/features/Firebase/firebaseDb';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { getDoc, setDoc } from 'firebase/firestore';
import { QuizSurvey2, QuizSurvey2FollowUpQuestion } from './types';
import * as Sentry from '@sentry/nextjs';
import { useTextAi } from '@/features/Ai/useTextAi';
import { useSettings } from '@/features/Settings/useSettings';
import { usePlan } from '@/features/Plan/usePlan';
import { ConversationMessage } from '@/common/conversation';
import { useAiUserInfo } from '@/features/Ai/useAiUserInfo';
import { fnv1aHash } from '@/libs/hash';
import { getWordsCount } from '@/libs/words';
import { NativeLangCode } from '@/libs/language/type';
import { guessLanguagesByCountry } from '@/libs/language/languageByCountry';
import { useAccess } from '@/features/Usage/useAccess';

type QuizStep =
  | 'before_nativeLanguage'
  | 'learnLanguage'
  | 'nativeLanguage'
  | 'before_pageLanguage'
  | 'pageLanguage'
  | 'before_recordAbout'
  | 'recordAbout'
  | 'before_recordAboutFollowUp'
  | 'recordAboutFollowUp'
  | 'before_recordAboutFollowUp2'
  | 'recordAboutFollowUp2'
  | 'reviewAbout'
  | 'before_goalReview'
  | 'callMode'
  | 'paidVsFree'
  | 'writeWelcomeMessageInChat'
  | 'teacherSelection'
  | 'accessPlan'
  | 'goalReview';

export const MIN_WORDS_FOR_ANSWER = 30;

const getHash = (input: string) => {
  if (!input) return '';

  return fnv1aHash(input);
};

const isAboutRecorded = (survey: QuizSurvey2) => {
  const transcript = survey.aboutUserTranscription || '';
  const wordsCount = getWordsCount(transcript);
  return wordsCount >= MIN_WORDS_FOR_ANSWER;
};

const isAboutFollowUpRecord = (survey: QuizSurvey2) => {
  const transcript = survey.aboutUserFollowUpTranscription || '';
  const wordsCount = getWordsCount(transcript);
  return wordsCount >= MIN_WORDS_FOR_ANSWER;
};

const isGoalIsRecorded = (survey: QuizSurvey2) => {
  const transcript = survey.goalUserTranscription || '';
  const wordsCount = getWordsCount(transcript);
  return wordsCount >= MIN_WORDS_FOR_ANSWER;
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

  test: () => Promise<void>;
  confirmPlan: () => Promise<void>;
  isFollowUpGenerating: boolean;
  isGoalQuestionGenerating: boolean;
  isGoalGenerating: boolean;
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
  const textAi = useTextAi();
  const settings = useSettings();
  const plan = usePlan();
  const userInfo = useAiUserInfo();

  const stepsViews: QuizStep[] = [
    'learnLanguage',
    'before_nativeLanguage',
    'nativeLanguage',

    'before_pageLanguage',
    'pageLanguage',

    'before_recordAbout',
    'recordAbout',
    'teacherSelection',

    'before_recordAboutFollowUp',
    'recordAboutFollowUp',

    'before_recordAboutFollowUp2',
    'recordAboutFollowUp2',

    'before_goalReview',
    'goalReview',
    'accessPlan',
    //"writeWelcomeMessageInChat",
  ];

  const [isFirstLoading, setIsFirstLoading] = useState(true);
  const defaultState: QuizUrlState = useMemo(
    () => ({
      learn: 'en',
      nativeLang: pageLang,
      pageLang,
      currentStep: stepsViews[0],
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
    console.log('✅ Survey doc updated: ' + label);
    return updatedSurvey;
  };

  const test = async () => {};

  const [isGeneratingFollowUpMap, setIsGeneratingFollowUpMap] = useState<Record<string, boolean>>(
    {},
  );
  const isFollowUpGenerating = Object.values(isGeneratingFollowUpMap).some((v) => v);

  const processAbout = async (
    survey: QuizSurvey2,
    hash: string,
  ): Promise<QuizSurvey2FollowUpQuestion> => {
    const learningLanguageFullName = fullLanguageName[survey.learningLanguageCode];
    const systemMessage = `You are an expert in ${learningLanguageFullName} language learning and helping people set effective language learning goals. Your task is to analyze a user's description of themselves then generate a follow-up question that encourages deeper reflection and provides additional context to help clarify their objectives.
The follow-up question should be open-ended and thought-provoking, designed to elicit more detailed responses.

Provide a brief explanation of why this question is important for understanding the user's motivations and goals.
Use user's language in needed, because sometime user cannot understand ${learningLanguageFullName} well.

Respond in JSON format with the following structure:
{
  "question": "A concise follow-up question to user. 1 short sentence using user's language. Less than 8 words",
  "subTitle": "A brief subtitle that provides context for user using user's language. 1 sentence",
  "description": "A short description explaining user the importance of the question using user's language. 2 sentences"
}

Ensure that the JSON is properly formatted and can be easily parsed.
Do not include any additional text outside of the JSON structure. 

Start response with symbol '{' and end with '}'. Your response will be parsed with js JSON.parse()
`;

    const parsedResult = await textAi.generateJson<{
      question: string;
      subTitle: string;
      description?: string;
    }>({
      systemMessage,
      userMessage: survey.aboutUserTranscription,
      model: 'gpt-4o',
      attempts: 4,
    });

    const newAnswer: QuizSurvey2FollowUpQuestion = {
      sourceTranscription: survey.aboutUserTranscription,
      title: parsedResult.question,
      subtitle: parsedResult.subTitle,
      description: parsedResult.description || '',
      hash,
    };

    return newAnswer;
  };

  const generatingFollowUp = async () => {
    const survey = surveyDoc;
    if (!survey) {
      return;
    }
    if (!isAboutRecorded(survey)) {
      return;
    }

    const initHash = getHash(survey.aboutUserTranscription || '');

    if (initHash === survey.aboutUserFollowUpQuestion.hash) {
      console.log('⏩ generatingFollowUp | Already generated, skipping');
      return;
    }

    if (isGeneratingFollowUpMap[initHash]) {
      console.log('⏩ generatingFollowUp | In progress, skipping');
      return;
    }

    setIsGeneratingFollowUpMap((prev) => ({ ...prev, [initHash]: true }));

    try {
      console.log('🦄 generatingFollowUp ');
      const newAnswer = await processAbout(survey, initHash);

      const afterHash = getHash(surveyRef.current?.aboutUserTranscription || '');

      if (afterHash !== initHash) {
        console.log('⏩ generatingFollowUp | User about changed, skipping analysis');
        setIsGeneratingFollowUpMap((prev) => ({ ...prev, [initHash]: false }));
        return;
      }

      await updateSurvey(
        {
          ...survey,
          aboutUserFollowUpQuestion: newAnswer,
        },
        'generatingFollowUp',
      );
      setIsGeneratingFollowUpMap((prev) => ({ ...prev, [initHash]: false }));
    } catch (e) {
      console.error('❌ generatingFollowUp | Error during analysis', e);
      Sentry.captureException(e, {
        extra: {
          title: 'Error in generatingFollowUp',
          text: survey.aboutUserFollowUpTranscription,
          survey,
        },
      });
      setIsGeneratingFollowUpMap((prev) => ({ ...prev, [initHash]: false }));
    }
  };

  const [isGeneratingGoalFollowUpMap, setIsGeneratingGoalFollowUpMap] = useState<
    Record<string, boolean>
  >({});
  const isGoalQuestionGenerating = Object.values(isGeneratingGoalFollowUpMap).some((v) => v);

  const createGoalQuestion = async (
    survey: QuizSurvey2,
    hash: string,
  ): Promise<QuizSurvey2FollowUpQuestion> => {
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

    const parsedResult = await textAi.generateJson<{
      question: string;
      subTitle: string;
      description?: string;
    }>({
      systemMessage,
      userMessage: `
About User:
${survey.aboutUserTranscription}

---

Follow-up question to user:
${survey.aboutUserFollowUpQuestion.title} (${survey.aboutUserFollowUpQuestion.description})

${survey.aboutUserFollowUpTranscription}
`,
      model: 'gpt-4o',
      attempts: 4,
    });

    const newAnswer: QuizSurvey2FollowUpQuestion = {
      sourceTranscription: survey.aboutUserFollowUpTranscription,
      title: parsedResult.question,
      subtitle: parsedResult.subTitle,
      description: parsedResult.description || '',
      hash,
    };

    return newAnswer;
  };

  const generateWelcomeMessage = async () => {
    const survey = surveyDoc;
    if (!survey) {
      return;
    }

    const systemPrompt = `Your goal is to create a user's welcome message they can send to chat of language learning community in ${
      fullLanguageName[languageToLearn]
    } language. The welcome message should be friendly, engaging, and reflect the user's personality based on their self-description.

The welcome message should be concise, ideally between 20 to 40 words, and should include:
1. A brief introduction of the user.
2. Their motivation for learning ${fullLanguageName[languageToLearn]}.
3. What they hope to achieve.

Example of your response (Use for inspiration only, do not copy):
Hello everyone! I'm excited to join this community as I embark on my journey to learn ${fullLanguageName[languageToLearn]}. I'm passionate about [Your Interests] and look forward to connecting with fellow learners. My goal is to become fluent and immerse myself in the culture. Let's learn together!
`;

    const usersInfo = [
      'AboutUser:',
      survey.aboutUserTranscription,
      survey.aboutUserFollowUpQuestion.title,
      survey.aboutUserFollowUpTranscription,
      survey.goalFollowUpQuestion.title,
      survey.goalUserTranscription,
    ]
      .map((text) => text.trim())
      .filter((text) => text.length > 0)
      .join(' ');

    const aiResponse = await textAi.generate({
      systemMessage: systemPrompt,
      userMessage: usersInfo,
      model: 'gpt-4o',
    });

    return aiResponse;
  };

  const generatingGoalQuestion = async () => {
    const survey = surveyDoc;
    if (!survey) {
      return;
    }
    if (!isAboutRecorded(survey) || !isAboutFollowUpRecord(survey)) {
      return;
    }

    const initHash = getHash(survey.aboutUserFollowUpTranscription || '');

    if (initHash === survey.goalFollowUpQuestion.hash) {
      console.log(`⏩ generatingGoalQuestion | Goal followup already generated, skipping`);
      return;
    }

    if (isGeneratingGoalFollowUpMap[initHash]) {
      console.log(`⏩ generatingGoalQuestion | Goal followup already in progress, skipping`);
      return;
    }

    console.log(`🦄 generatingGoalQuestion | Starting analysis for text length`);
    setIsGeneratingGoalFollowUpMap((prev) => ({ ...prev, [initHash]: true }));

    try {
      const newGoalQuestion = await createGoalQuestion(survey, initHash);

      const afterHash = getHash(surveyRef.current?.aboutUserFollowUpTranscription || '');

      if (afterHash !== initHash) {
        console.log(`⏩ generatingGoalQuestion | User about followup changed, skipping analysis`);
        setIsGeneratingGoalFollowUpMap((prev) => ({
          ...prev,
          [initHash]: false,
        }));
        return;
      }

      await updateSurvey(
        {
          ...(surveyRef.current || survey),
          goalFollowUpQuestion: newGoalQuestion,
        },
        'generatingGoalQuestion',
      );
      setIsGeneratingGoalFollowUpMap((prev) => ({
        ...prev,
        [initHash]: false,
      }));
      return;
    } catch (e) {
      console.error('❌ generatingGoalQuestion | Error during analysis', e);
      Sentry.captureException(e, {
        extra: {
          title: 'Error in generatingGoalQuestion',
          text: survey.aboutUserFollowUpTranscription,
          survey,
        },
      });
      setIsGeneratingGoalFollowUpMap((prev) => ({
        ...prev,
        [initHash]: false,
      }));
    }
  };

  const [isGoalGeneratingMap, setIsGoalGeneratingMap] = useState<Record<string, boolean>>({});
  const isGoalGenerating = Object.values(isGoalGeneratingMap).some((v) => v);

  const generateGoal = async () => {
    const survey = surveyRef.current;
    if (!survey) {
      return;
    }

    const isReadyToGenerateGoal = isGoalIsRecorded(survey);
    if (!isReadyToGenerateGoal) {
      console.log('⏩ generateGoal | not ready');
      return;
    }

    const initialSurveyHash = getHash(survey.goalUserTranscription || '');
    if (initialSurveyHash === survey.goalHash) {
      console.log('⏩ generateGoal | Survey not changed');
      return;
    }

    setIsGoalGeneratingMap((prev) => ({ ...prev, [initialSurveyHash]: true }));
    const conversationMessages: ConversationMessage[] = [
      {
        id: `about_user`,
        isBot: false,
        text: `${survey.aboutUserTranscription}`,
      },
      {
        id: `about_user_followup_question`,
        isBot: true,
        text: `${survey.aboutUserFollowUpQuestion.title}\n${
          survey.aboutUserFollowUpQuestion.description || ''
        }`,
      },
      {
        id: `about_user_followup_answer`,
        isBot: false,
        text: `${survey.aboutUserFollowUpTranscription || 'No answer provided'}`,
      },
      {
        id: `goal_followup_question`,
        isBot: true,
        text: `${survey.goalFollowUpQuestion.title}\n${
          survey.goalFollowUpQuestion.description || ''
        }`,
      },
      {
        id: `goal_followup_answer`,
        isBot: false,
        text: `${survey.goalUserTranscription || 'No answer provided'}`,
      },
    ];

    console.log('🦄 generateGoal | Starting goal generation.');
    const generateExampleRequest = generateWelcomeMessage();

    const userRecords = await userInfo.extractUserRecords(conversationMessages);
    const goal = await plan.generateGoal({
      languageCode: languageToLearn,
      conversationMessages: conversationMessages,
      userInfo: userRecords,
    });
    const exampleOfWelcomeMessage = await generateExampleRequest;

    setIsGoalGeneratingMap((prev) => ({ ...prev, [initialSurveyHash]: false }));

    const finalSurveyHash = getHash(surveyRef.current?.goalUserTranscription || '');
    if (initialSurveyHash !== finalSurveyHash) {
      console.log('🦄 generateGoal | Survey changed during goal generation, skipping update');
      return;
    }
    if (!surveyRef.current) return;
    await updateSurvey(
      {
        ...surveyRef.current,
        goalData: goal,
        goalHash: finalSurveyHash,
        userRecords: userRecords,
        exampleOfWelcomeMessage:
          exampleOfWelcomeMessage || (surveyRef.current || survey).exampleOfWelcomeMessage || '',
      },
      'generateGoal',
    );
  };

  useEffect(() => {
    generatingFollowUp();
    generatingGoalQuestion();
    generateGoal();
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
          'ensureSurveyDocExists',
        );

        await syncWithSettings(survey);
      }
      return;
    }
    if (!auth.uid) {
      throw new Error('ensureSurveyDocExists | No auth uid');
    }

    if (!surveyDocRef) {
      throw new Error('ensureSurveyDocExists | No survey doc ref');
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
        userRecords: userInfo.userInfo?.records || [],

        updatedAtIso: new Date().toISOString(),
        createdAtIso: new Date().toISOString(),
      };
      await setDoc(surveyDocRef, initSurvey);
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

  const access = useAccess();
  const isFullAppAccess = access.isFullAppAccess;
  const path = useMemo(() => {
    const isNativeLanguageIsSupportedLanguage = (supportedLanguages as string[]).includes(
      nativeLanguage,
    );

    const path = stepsViews.filter((viewStep) => {
      if (isFullAppAccess && viewStep === 'accessPlan') {
        return false;
      }

      if (viewStep === 'pageLanguage' || viewStep === 'before_pageLanguage') {
        if (isNativeLanguageIsSupportedLanguage) {
          return false;
        } else {
          return true;
        }
      }

      return true;
    });

    return path;
  }, [nativeLanguage, isFullAppAccess]);
  const currentStepIndex = path.indexOf(currentStep) === -1 ? 0 : path.indexOf(currentStep);

  const [isGTagConfirmed, setIsGTagConfirmed] = useState(false);

  const nextStep = async () => {
    const nextStepIndex = Math.min(currentStepIndex + 1, path.length - 1);
    const nextStep = path[nextStepIndex];

    const confirmGTagSteps: QuizStep[] = [
      'recordAboutFollowUp',
      'before_recordAboutFollowUp2',
      'recordAboutFollowUp2',
      'before_goalReview',
      'goalReview',
    ];
    if (!isGTagConfirmed && confirmGTagSteps.includes(currentStep)) {
      setIsGTagConfirmed(true);
      // confirmGtag();
    }

    if (currentStep === 'before_recordAbout') {
      ensureSurveyDocExists();
    }

    let newStatePatch: Partial<QuizUrlState> = {
      currentStep: nextStep,
    };

    if (currentStep === 'learnLanguage') {
      const langPatch = await preFindNativeLanguage(languageToLearn);
      newStatePatch = {
        ...newStatePatch,
        ...langPatch,
      };
    }
    let url = await setState(newStatePatch, {
      redirect: false,
    });

    if (url && currentStep === 'nativeLanguage') {
      const isNativeLanguageIsSupportedLanguage = (supportedLanguages as string[]).includes(
        nativeLanguage,
      );
      if (isNativeLanguageIsSupportedLanguage && pageLang !== nativeLanguage) {
        url = replaceUrlToLang(nativeLanguage, url);
      }
    }
    router.push(url || '', { scroll: false });
  };

  const prevStep = useCallback(() => {
    const prevStepIndex = Math.max(currentStepIndex - 1, 0);
    const prevStep = path[prevStepIndex];
    setState({ currentStep: prevStep });
  }, [currentStepIndex, path, setState]);

  const navigateToMainPage = () => {
    const newPath = `${getUrlStart(pageLanguage)}`;
    router.push(newPath);
  };

  const progress = currentStepIndex / path.length + 0.1;

  const confirmPlan = async () => {
    if (!surveyRef.current?.goalData) {
      alert('Please complete the goal before confirming your plan.');
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
    isFollowUpGenerating,
    isGoalQuestionGenerating,
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
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};
