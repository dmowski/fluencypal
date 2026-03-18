import { useLingui } from '@lingui/react';
import { Alert, Button, IconButton, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { ChevronDown, FlaskConicalOff, Gem, PlaneTakeoff, RefreshCcw, Sprout } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AdvancedUserRecord } from '@/common/userInfo';
import { useTextAi } from '../../Ai/useTextAi';
import { useAuth } from '../../Auth/useAuth';
import { useAiUserInfo } from '../../Ai/useAiUserInfo';
import { sleep } from '@/libs/sleep';
import { GrammarImprovementModal } from './GrammarImprovementModal';
import { GrammarImprovementRow } from './GrammarImprovementRow';
import { grammarImprovementSystemPrompt } from './prompt';
import { GrammarImprovement } from './types';
import { useSettings } from '@/features/Settings/useSettings';
import { fullEnglishLanguageName, SupportedLanguage } from '@/features/Lang/lang';
import { useQuizWordAudio } from '@/features/Audio/useQuizWordAudio';
import { SectionHeader } from '../CartsHeader';
import { RowItem, StoreCard } from '@/features/uiKit/Card/StoreCard';
import dayjs from 'dayjs';

const limitCount = 3;

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
  const auth = useAuth();

  const textAi = useTextAi();

  const fullLanguageName = fullEnglishLanguageName[languageCode];

  const [isShowList, setIsShowList] = useState(true);
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

  useEffect(() => {
    if (selectedIndex === null) {
      return;
    }

    if (grammarPoints.length === 0) {
      setSelectedIndex(null);
      return;
    }

    if (selectedIndex >= grammarPoints.length) {
      setSelectedIndex(grammarPoints.length - 1);
    }
  }, [grammarPoints.length, selectedIndex]);

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

  const items: RowItem[] = [];

  grammarPoints.forEach((record, index) => {
    items.push({
      title: dayjs(record.createdAtDayIso).format('MMMM D, YYYY'),
      subTitle: record.value.substring(0, 100) + (record.value.length > 100 ? '...' : ''),
      imageUrl:
        'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1773858639762-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png',
      actionButtonTitle: i18n._('Open'),
      onClick: function (): void {
        handleOpenModal(index);
      },
    });
  });

  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <SectionHeader
        title={i18n._('Grammar Improvements')}
        subTitle={i18n._(
          'Based on your recent conversations, here are some tips to improve your grammar',
        )}
      />

      <StoreCard
        badge={''}
        textColor={'#fff'}
        backgroundColor={'#6A5439'}
        borderSize={'0px'}
        previewImageUrl={
          'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1773858639762-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png'
        }
        label={'JUST TALK MODE'}
        title={i18n._('Conversation with AI')}
        subTitle={i18n._(
          "Start a casual call to practice your communication skills. This is a no-strings-attached conversation if you'd like to chat in a casual setting.",
        )}
        items={items}
        itemsBackgroundColor={'#1C1C1E'}
        onClick={() => {
          //startJustTalk();
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
