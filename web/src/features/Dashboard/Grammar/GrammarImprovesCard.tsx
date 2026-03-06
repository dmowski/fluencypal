import { useLingui } from '@lingui/react';
import { Button, IconButton, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { ChevronDown, RefreshCcw } from 'lucide-react';
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
Use ${nativeLanguageCode} for explanations, be creative with explanations. Description should be really easy to understand for the user. Use simple words and avoid complex grammar in the description.`;

      const finalSystemInstruction = `${grammarImprovementSystemPrompt}.
${postfixInstruction}`;

      console.log('finalSystemInstruction', finalSystemInstruction, '|', userPrompt);

      const response = await textAi.generateJson<GrammarImprovement>({
        systemMessage: finalSystemInstruction,
        userMessage: userPrompt,
        attempts: 3,
        model: 'gpt-4o',
        //cache: true,
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
    for (const record of grammarPoints) {
      void fetchImprovement(record);
    }
  }, [fetchImprovement, grammarPoints]);

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

  const regenerate = async () => {
    setIsShowList(false);
    await sleep(50);
    setIsShowList(true);
  };

  const handleOpenModal = (index: number) => {
    setSelectedIndex(index);
  };

  const handleCloseModal = () => {
    setSelectedIndex(null);
  };

  const handleNext = () => {
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex;
      }

      return Math.min(currentIndex + 1, grammarPoints.length - 1);
    });
  };

  const handlePrevious = () => {
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex;
      }

      return Math.max(currentIndex - 1, 0);
    });
  };

  return (
    <Stack
      sx={{
        marginBottom: '20px',
        alignItems: 'flex-start',
        gap: '30px',

        width: '100%',
        borderRadius: '16px',
        position: 'relative',
        //padding: '40px',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        '@media (max-width:600px)': {
          borderRadius: '0px',
          padding: '40px 0px 0px 0px',
          backgroundColor: 'rgba(255, 255, 255, 0)',
          border: 'none',
        },
      }}
    >
      <Stack
        sx={{
          gap: '30px',
          padding: '30px 30px 30px 30px',
          '@media (max-width:600px)': {
            padding: '0px 20px 0 20px',
          },
        }}
      >
        <Stack
          sx={{
            gap: '10px',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: '800',
              textWrap: 'balance',
              '@media (max-width:600px)': {
                fontSize: '2rem',
                lineHeight: '2.2rem',
              },
            }}
          >
            {i18n._('Improvements to your grammar')}
          </Typography>

          <Typography
            sx={{
              opacity: 0.9,
            }}
          >
            {i18n._(
              'Based on your recent conversations, here are some tips to improve your grammar. Click on the tip to see more details!',
            )}
          </Typography>
        </Stack>

        {isShowList && (
          <Stack
            sx={{
              gap: '10px',
            }}
          >
            {grammarPoints.length === 0 ? (
              <Typography sx={{ opacity: 0.8 }} variant="body2">
                {i18n._('No grammar insights yet. Start chatting to get personalized tips!')}
              </Typography>
            ) : (
              grammarPoints.slice(0, limit).map((record, index) => {
                const key = record.value;

                return (
                  <GrammarImprovementRow
                    key={record.value}
                    improvement={improvements[key] || null}
                    isLoading={!improvements[key]}
                    onClick={() => handleOpenModal(index)}
                  />
                );
              })
            )}

            {isLimited && (
              <Button
                startIcon={<ChevronDown size={'18px'} />}
                variant="text"
                size="small"
                onClick={() => setShowAll(true)}
              >
                {i18n._('Show all improvements')}
              </Button>
            )}
          </Stack>
        )}

        {selectedIndex !== null && grammarPoints[selectedIndex] && (
          <GrammarImprovementModal
            improvement={improvements[grammarPoints[selectedIndex].value] || null}
            isLoading={!improvements[grammarPoints[selectedIndex].value]}
            isFirstOne={selectedIndex === 0}
            isLastOne={selectedIndex === grammarPoints.length - 1}
            isOpen={true}
            scrollResetKey={selectedIndex}
            onClose={handleCloseModal}
            onClickNext={handleNext}
            onClickPrevious={handlePrevious}
          />
        )}
      </Stack>
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
