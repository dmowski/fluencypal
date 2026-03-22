'use client';

import { createContext, JSX, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AdvancedUserRecord } from '@/features/User/userInfo';
import { useTextAi } from '../../Ai/useTextAi';
import { useAiUserInfo } from '../../User/useAiUserInfo';
import { sleep } from '@/libs/sleep';
import { grammarImprovementSystemPrompt } from './prompt';
import { GrammarImprovement } from './types';
import { useSettings } from '@/features/Settings/useSettings';
import { fullEnglishLanguageName, SupportedLanguage } from '@/features/Lang/lang';
import { useQuizWordAudio } from '@/features/Audio/useQuizWordAudio';
import { useUrlState } from '@/features/Url/useUrlState';

interface TitleMetadata {
  title: string;
  subTitle: string;
}

interface GrammarImprovementContextValue {
  grammarPoints: AdvancedUserRecord[];
  languageCode: SupportedLanguage;
  nativeLanguageCode: string;
  selectedIndex: number | null;
  improvements: Record<string, GrammarImprovement>;
  titleMap: Record<string, TitleMetadata | null>;
  isLoadingNew: boolean;
  showAvailable: () => void;
  handleOpenModal: (index: number) => Promise<void>;
  handleCloseModal: () => void;
  handleNext: () => Promise<void>;
  handlePrevious: () => Promise<void>;
}

const GrammarImprovementContext = createContext<GrammarImprovementContextValue | null>(null);

export const GrammarImprovementProvider = ({
  children,
  grammarPointsOverride,
  languageCodeOverride,
  nativeLanguageCodeOverride,
}: {
  children: React.ReactNode;
  grammarPointsOverride?: AdvancedUserRecord[];
  languageCodeOverride?: SupportedLanguage;
  nativeLanguageCodeOverride?: string;
}): JSX.Element => {
  const textAi = useTextAi();
  const userInfo = useAiUserInfo();
  const settings = useSettings();

  const grammarPoints = grammarPointsOverride ?? userInfo.grammarRecords;
  const languageCode: SupportedLanguage = languageCodeOverride ?? settings.languageCode ?? 'en';
  const nativeLanguageCode =
    nativeLanguageCodeOverride ??
    settings.userSettings?.nativeLanguageCode ??
    settings.userSettings?.pageLanguageCode ??
    'en';

  const fullLanguageName = fullEnglishLanguageName[languageCode];

  const [selectedIndex, setSelectedIndex] = useUrlState<number | null>('improvement', null, false);
  const [improvements, setImprovements] = useState<Record<string, GrammarImprovement>>({});
  const [titleMap, setTitleMap] = useState<Record<string, TitleMetadata | null>>({});
  const [isLoadingNew, setIsLoadingNew] = useState(false);

  const quizWordAudio = useQuizWordAudio({ targetLanguage: languageCode });

  const improvementsMapRef = useRef<Record<string, GrammarImprovement>>({});
  const loadingMap = useRef<Record<string, Promise<GrammarImprovement> | null>>({});
  const isMetadataGenerating = useRef(false);

  const generateImprovement = useCallback(
    async (record: AdvancedUserRecord): Promise<GrammarImprovement> => {
      const userPrompt = `${record.value}`;
      const isNativeLanguageSameAsLearning = nativeLanguageCode === languageCode;
      const postfixInstruction = isNativeLanguageSameAsLearning
        ? `The user is learning ${fullLanguageName}. Use this language for all properties (example, description, title).`
        : `The user is learning ${fullLanguageName}. Native language of the user is ${nativeLanguageCode}.
        
Use ${fullLanguageName} for example sentences.
Use ${nativeLanguageCode} for explanations, be creative with explanations. Description should be really easy to understand for the user and short. Use simple words and avoid complex grammar in the description.`;

      const finalSystemInstruction = `${grammarImprovementSystemPrompt}.
${postfixInstruction}`;

      const response = await textAi.generateJson<GrammarImprovement>({
        systemMessage: finalSystemInstruction,
        userMessage: userPrompt,
        attempts: 3,
        model: 'gpt-5.4',
        cache: true,
      });

      return {
        title: response?.title || `???`,
        description: response?.description || `???`,
        examples: response?.examples || [],
      };
    },
    [textAi, fullLanguageName, nativeLanguageCode, languageCode],
  );

  const generateTitleImprovement = async (record: AdvancedUserRecord): Promise<TitleMetadata> => {
    const userPrompt = `${record.value}`;
    const finalSystemInstruction = `Your goal is to create a short title for the following grammar point. Return only 3-4 words in your response. Return JSON with "title" and "subTitle" properties. The title should be catchy and make the user want to click on it`;

    const data = await textAi.generateJson<TitleMetadata>({
      systemMessage: finalSystemInstruction,
      userMessage: userPrompt,
      model: 'gpt-4o',
      cache: true,
    });

    return data;
  };

  const generateMetadata = async (limit: number) => {
    const pointsToGenerate = grammarPoints.slice(0, limit);
    if (pointsToGenerate.length === 0) return;
    if (isMetadataGenerating.current) return;
    isMetadataGenerating.current = true;

    await Promise.all(
      pointsToGenerate.map(async (record, index) => {
        const key = record.value;
        if (titleMap[key]) return titleMap[key];

        await sleep(index * 2 + 10);
        const improvement = await generateTitleImprovement(record);
        setTitleMap((prev) => ({ ...prev, [key]: improvement }));
        return improvement;
      }),
    );

    isMetadataGenerating.current = false;
  };

  const fetchImprovement = useCallback(
    async (record: AdvancedUserRecord) => {
      const key = record.value;
      console.log('Fetch record', record);

      const existingImprovement = improvementsMapRef.current[key];
      if (existingImprovement) return existingImprovement;

      const existingRequest = loadingMap.current[key];
      if (existingRequest) return existingRequest;

      const request = generateImprovement(record)
        .then((result) => {
          setImprovements((prevState) => {
            if (prevState[key]) return prevState;
            const nextState = { ...prevState, [key]: result };
            improvementsMapRef.current = nextState;
            return nextState;
          });
          return result;
        })
        .finally(() => {
          loadingMap.current[key] = null;
        });

      loadingMap.current[key] = request;
      return request;
    },
    [generateImprovement],
  );

  const handleOpenModal = useCallback(
    async (index: number) => {
      await quizWordAudio.initAudio();
      setSelectedIndex(index);
    },
    [quizWordAudio, setSelectedIndex],
  );

  const showAvailable = useCallback(() => {
    if (grammarPoints.length > 0) {
      handleOpenModal(0);
    }
  }, [grammarPoints.length, handleOpenModal]);

  useEffect(() => {
    if (selectedIndex === null || selectedIndex === -1 || grammarPoints.length === 0) return;
    const selectedRecord = grammarPoints[selectedIndex];
    if (!selectedRecord) return;
    fetchImprovement(selectedRecord);
  }, [selectedIndex, grammarPoints.length]);

  const handleCloseModal = useCallback(() => {
    setSelectedIndex(null);
  }, [setSelectedIndex]);

  const handleNext = useCallback(async () => {
    if (selectedIndex === null) return;
    setIsLoadingNew(true);
    setSelectedIndex(null);
    await sleep(300);
    setSelectedIndex(Math.min(selectedIndex + 1, grammarPoints.length - 1));
    setIsLoadingNew(false);
  }, [selectedIndex, grammarPoints.length, setSelectedIndex]);

  const handlePrevious = useCallback(async () => {
    setIsLoadingNew(true);
    await sleep(10);
    setSelectedIndex(null);
    await sleep(300);
    const activeIndex = selectedIndex ?? 0;
    const previousIndex = activeIndex === 0 ? grammarPoints.length - 1 : activeIndex - 1;
    setSelectedIndex(previousIndex);
    setIsLoadingNew(false);
  }, [selectedIndex, setSelectedIndex]);

  useEffect(() => {
    generateMetadata(grammarPoints.length);
  }, [grammarPoints.length]);

  return (
    <GrammarImprovementContext.Provider
      value={{
        grammarPoints,
        languageCode,
        nativeLanguageCode,
        selectedIndex,
        improvements,
        titleMap,
        isLoadingNew,
        showAvailable,
        handleOpenModal,
        handleCloseModal,
        handleNext,
        handlePrevious,
      }}
    >
      {children}
    </GrammarImprovementContext.Provider>
  );
};

export const useGrammarImprovement = (): GrammarImprovementContextValue => {
  const ctx = useContext(GrammarImprovementContext);
  if (!ctx) {
    throw new Error('useGrammarImprovement must be used within GrammarImprovementProvider');
  }
  return ctx;
};
