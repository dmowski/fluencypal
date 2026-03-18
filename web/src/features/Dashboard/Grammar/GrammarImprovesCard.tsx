'use client';

import { useLingui } from '@lingui/react';
import Stack from '@mui/material/Stack';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AdvancedUserRecord } from '@/common/userInfo';
import { useTextAi } from '../../Ai/useTextAi';
import { useAiUserInfo } from '../../Ai/useAiUserInfo';
import { sleep } from '@/libs/sleep';
import { GrammarImprovementModal } from './GrammarImprovementModal';
import { grammarImprovementSystemPrompt } from './prompt';
import { GrammarImprovement } from './types';
import { useSettings } from '@/features/Settings/useSettings';
import { fullEnglishLanguageName, SupportedLanguage } from '@/features/Lang/lang';
import { useQuizWordAudio } from '@/features/Audio/useQuizWordAudio';
import { SectionHeader } from '../CartsHeader';
import { RowItem, StoreCard } from '@/features/uiKit/Card/StoreCard';
import { IconName } from 'lucide-react/dynamic';

interface TitleMetadata {
  title: string;
  subTitle: string;
}

const limitCount = 3;

const improvementsIcons: {
  color: string;
  iconName: IconName;
}[] = [
  {
    color: '#335FFC',
    iconName: 'star',
  },
  {
    color: '#FF6AD8',
    iconName: 'heart',
  },
  {
    color: '#00C2FF',
    iconName: 'thumbs-up',
  },
  {
    color: '#FF8A00',
    iconName: 'zap',
  },
  {
    color: '#00FFAB',
    iconName: 'smile',
  },
];

export const GrammarImprovesCardUi = ({
  grammarPoints,
  languageCode,
  nativeLanguageCode,
}: {
  grammarPoints: AdvancedUserRecord[];
  languageCode: SupportedLanguage;
  nativeLanguageCode: string;
}) => {
  const { i18n } = useLingui();

  const textAi = useTextAi();

  const fullLanguageName = fullEnglishLanguageName[languageCode];

  const [showAll, setShowAll] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [improvements, setImprovements] = useState<Record<string, GrammarImprovement>>({});
  const quizWordAudio = useQuizWordAudio({ targetLanguage: languageCode });

  const improvementsMapRef = useRef<Record<string, GrammarImprovement>>({});
  const loadingMap = useRef<Record<string, Promise<GrammarImprovement> | null>>({});

  const limit = showAll ? grammarPoints.length : limitCount;
  const isLimited = grammarPoints.length > limitCount && !showAll;

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
    [textAi, fullLanguageName],
  );

  const [titleMap, setTitleMap] = useState<Record<string, TitleMetadata | null>>({});

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

  const isMetadataGenerating = useRef(false);
  const generateMetadata = async (limit: number) => {
    const pointsToGenerate = grammarPoints.slice(0, limit);
    if (pointsToGenerate.length === 0) {
      return;
    }
    if (isMetadataGenerating.current) {
      return;
    }
    isMetadataGenerating.current = true;

    await Promise.all(
      pointsToGenerate.map(async (record, index) => {
        const key = record.value;
        if (titleMap[key]) {
          return titleMap[key];
        }

        await sleep(index * 2 + 10);
        const improvement = await generateTitleImprovement(record);
        setTitleMap((prev) => ({ ...prev, [key]: improvement }));
        return improvement;
      }),
    );

    isMetadataGenerating.current = false;
  };

  useEffect(() => {
    generateMetadata(limit);
  }, [grammarPoints.length, limit]);

  const fetchImprovement = useCallback(
    async (record: AdvancedUserRecord) => {
      const key = record.value;

      const existingImprovement = improvementsMapRef.current[key];
      if (existingImprovement) {
        return existingImprovement;
      }

      const existingRequest = loadingMap.current[key];
      if (existingRequest) {
        return existingRequest;
      }

      const request = generateImprovement(record)
        .then((result) => {
          setImprovements((prevState) => {
            if (prevState[key]) {
              return prevState;
            }

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

  const handleOpenModal = async (index: number) => {
    fetchAllImprovements();
    await quizWordAudio.initAudio();
    setSelectedIndex(index);
  };

  const fetchAllImprovements = useCallback(async () => {
    await Promise.all(grammarPoints.map((record) => fetchImprovement(record)));
  }, [fetchImprovement, grammarPoints, limit]);

  const handleCloseModal = () => {
    setSelectedIndex(null);
  };

  const [isLoadingNew, setIsLoadingNew] = useState(false);

  const handleNext = async () => {
    if (selectedIndex === null) {
      return;
    }
    setIsLoadingNew(true);

    setSelectedIndex(null);
    await sleep(300);

    setSelectedIndex(Math.min(selectedIndex + 1, grammarPoints.length - 1));
    setIsLoadingNew(false);
  };

  const handlePrevious = async () => {
    if (selectedIndex === null) {
      return;
    }
    setIsLoadingNew(true);
    setSelectedIndex(null);
    await sleep(300);

    setSelectedIndex(Math.max(selectedIndex - 1, 0));
    setIsLoadingNew(false);
  };

  const items: RowItem[] = useMemo(() => {
    const newItems: RowItem[] = [];

    grammarPoints.slice(0, limit).forEach((record, index) => {
      const icon = improvementsIcons[index % improvementsIcons.length];
      const fullTitle = titleMap[record.value]?.title || `...`;
      const subTitle = titleMap[record.value]?.subTitle || '...';

      newItems.push({
        title: fullTitle,
        subTitle: subTitle,
        iconName: 'book',
        bgColor: icon.color,
        actionButtonTitle: i18n._('Open'),
        onClick: function (): void {
          handleOpenModal(index);
        },
      });
    });

    if (isLimited) {
      newItems.push({
        title: i18n._('More improvements'),
        subTitle: i18n._('Show all your grammar improvements.'),
        iconName: 'eye',
        bgColor: '#888',
        actionButtonTitle: i18n._('More...'),
        onClick: function (): void {
          setShowAll(true);
        },
      });
    }

    return newItems;
  }, [grammarPoints.length, titleMap]);

  if (isLoadingNew) {
    return (
      <Stack
        sx={{
          width: '100dvw',
          height: '100dvh',
          backgroundColor: '#181818',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 9999,
        }}
      />
    );
  }

  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <SectionHeader
        title={i18n._('Grammar Improvements')}
        subTitle={i18n._(
          'Personalized explanations and examples to help you understand and improve your grammar.',
        )}
      />

      <StoreCard
        badge={''}
        textColor={'#fff'}
        backgroundColor={'#6A5439'}
        previewImageUrl={
          'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1773858639762-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png'
        }
        label={i18n._('PRACTICE, IMPROVE, REPEAT')}
        title={i18n._('Enough with speaking? Time to improve!')}
        subTitle={''}
        items={items}
        emptyItemsStateText={i18n._(
          'No grammar mistakes found. Keep practicing to see improvements here!',
        )}
        itemsBackgroundColor={'rgba(45, 45, 46, 0.8)'}
        onClick={() => {
          if (grammarPoints.length > 0) {
            handleOpenModal(0);
          }
        }}
        itemsViewMode={'list'}
      />

      {selectedIndex !== null && grammarPoints[selectedIndex] && (
        <GrammarImprovementModal
          improvement={improvements[grammarPoints[selectedIndex].value] || null}
          isLoading={!improvements[grammarPoints[selectedIndex].value]}
          isFirstOne={selectedIndex === 0}
          isLastOne={selectedIndex === grammarPoints.length - 1}
          isOpen={true}
          onClose={handleCloseModal}
          onClickNext={handleNext}
          onClickPrevious={handlePrevious}
        />
      )}
    </Stack>
  );
};

export const GrammarImprovesCard = () => {
  const userInfo = useAiUserInfo();
  const grammarPoints = userInfo.grammarRecords;
  const settings = useSettings();
  const languageCode = settings.languageCode || 'en';
  const nativeLanguageCode =
    settings.userSettings?.nativeLanguageCode || settings.userSettings?.pageLanguageCode || 'en';

  if (settings.loading) {
    return <></>;
  }
  return (
    <GrammarImprovesCardUi
      grammarPoints={grammarPoints}
      languageCode={languageCode}
      nativeLanguageCode={nativeLanguageCode}
    />
  );
};
