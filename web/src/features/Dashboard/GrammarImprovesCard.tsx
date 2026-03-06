import { useLingui } from '@lingui/react';

import { Button, IconButton, Typography } from '@mui/material';
import Stack from '@mui/material/Stack';
import { useAiUserInfo } from '../Ai/useAiUserInfo';
import { AdvancedUserRecord } from '@/common/userInfo';
import { useAuth } from '../Auth/useAuth';
import { useEffect, useRef, useState } from 'react';
import { LoadingShapes } from '../uiKit/Loading/LoadingShapes';
import { sleep } from '@/libs/sleep';
import { ChevronDown, ChevronRight, Languages, RefreshCcw } from 'lucide-react';
import { useTextAi } from '../Ai/useTextAi';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { Markdown } from '../uiKit/Markdown/Markdown';
import { useTranslate } from '../Translation/useTranslate';
import { AudioPlayIcon } from '../Audio/AudioPlayIcon';

export const GrammarImprovesCard = () => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const userInfo = useAiUserInfo();
  const grammarPoints = userInfo.grammarRecords;

  const [isShowList, setIsShowList] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const limitCount = 1;
  const limit = showAll ? grammarPoints.length : limitCount;
  const isLimited = grammarPoints.length > limitCount && !showAll;

  const regenerate = async () => {
    setIsShowList(false);
    await sleep(50);
    setIsShowList(true);
  };

  if (!auth.isFounder) {
    return <></>;
  }
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
      {auth.isFounder && (
        <IconButton
          onClick={regenerate}
          sx={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            opacity: 0.7,
          }}
        >
          <RefreshCcw size={'19px'} />
        </IconButton>
      )}
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
              <Typography sx={{ opacity: 0.8 }}>
                {i18n._('No grammar insights yet. Start chatting to get personalized tips!')}
              </Typography>
            ) : (
              grammarPoints
                .slice(0, limit)
                .map((record, index) => <GrammarImprovementCard key={index} record={record} />)
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
      </Stack>
    </Stack>
  );
};

interface GrammarImprovement {
  title: string;
  description: string;
  examples: string[];
}

export const GrammarImprovementCard = ({ record }: { record: AdvancedUserRecord }) => {
  const [isLoading, setIsLoading] = useState(true);
  const textAi = useTextAi();
  const [improvement, setImprovement] = useState<GrammarImprovement | null>(null);
  const [isFullSize, setIsFullSize] = useState(false);

  const translator = useTranslate();

  const generateImprovement = async (): Promise<GrammarImprovement> => {
    await sleep(1000); // Simulate loading time

    const systemPrompt = `You are a helpful assistant that provides grammar improvement suggestions based on user records.
Given a user record, analyze it and provide a specific grammar improvement suggestion. Focus on one key improvement that would have the most impact for the user.

The response should be in JSON format with the following structure:
{
  "title": "A concise title for the improvement. 3-4 words max.",
  "examples": ["Example sentence 1 showing the correct usage", "Example sentence 2 showing the correct usage"],
  "description": "A detailed explanation of the improvement and why it's important. Use markdown formatting to make it easy to read.",
}

Make sure the title is catchy and easy to understand, and that the description provides clear guidance on how to improve. The examples should clearly illustrate the mistake and the correct usage. 

Provide 7 examples if possible. Use only corrected sentences in the examples, do not include incorrect sentences.
In examples, highlight the part that is relevant to the improvement by making it bold. For example, if the improvement is about using the correct preposition, the example could be: "I am interested in **learning** new languages."
`;
    const userPrompt = `record: ${record.value}`;

    const response = await textAi.generateJson<GrammarImprovement>({
      systemMessage: systemPrompt,
      userMessage: userPrompt,
      attempts: 3,
      model: 'gpt-4o',
      cache: true,
    });

    return {
      title: response?.title || `???`,
      description: response?.description || `???`,
      examples: response?.examples || [],
    };
  };

  const rowHeight = '40px';

  const loadingMap = useRef<Record<string, Promise<GrammarImprovement> | null>>({});

  const fetchImprovement = async () => {
    setIsLoading(true);
    const key = record.value;

    const resultRequest = loadingMap.current[key] || generateImprovement();
    loadingMap.current[key] = resultRequest;
    const result = await resultRequest;
    setImprovement(result);
    setIsLoading(false);
    return;
  };

  useEffect(() => {
    fetchImprovement();
  }, [record]);

  if (isLoading || !improvement) {
    return <LoadingShapes sizes={[rowHeight]} />;
  }

  return (
    <>
      {isFullSize && (
        <CustomModal isOpen={isFullSize} onClose={() => setIsFullSize(false)}>
          <Stack sx={{ gap: '60px', padding: '20px', maxWidth: '700px', paddingBottom: '80px' }}>
            {translator.translateModal}
            <Stack
              sx={{
                gap: '10px',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  fontWeight: '800',
                }}
              >
                {improvement.title}
              </Typography>
              <Stack>
                <Markdown
                  variant="conversation"
                  onWordClick={
                    translator.isTranslateAvailable
                      ? (word, element) => {
                          translator.translateWithModal(word, element);
                        }
                      : undefined
                  }
                >
                  {'\n' + improvement.description}
                </Markdown>
              </Stack>
            </Stack>

            {improvement.examples.length > 0 && (
              <Stack sx={{ gap: '10px' }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: '700',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  Examples:
                </Typography>
                <Stack
                  sx={{
                    gap: '30px',
                    '* strong': {
                      backgroundColor: 'rgba(11, 130, 194, 0.79)',
                      padding: '2px 2px 2px 8px',
                      marginRight: '5px',
                      borderRadius: '5px',
                      fontWeight: '700',
                      // prevent word break in the middle of the highlighted part
                      whiteSpace: 'nowrap',
                    },
                  }}
                >
                  {improvement.examples.map((example, index) => (
                    <Stack
                      key={index}
                      sx={{
                        gap: '5px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '8px',
                        //padding: '10px',
                        overflow: 'hidden',
                      }}
                    >
                      <Stack
                        sx={{
                          padding: '10px',
                        }}
                      >
                        <Markdown
                          onWordClick={
                            translator.isTranslateAvailable
                              ? (word, element) => {
                                  translator.translateWithModal(word, element);
                                }
                              : undefined
                          }
                          variant="conversation"
                        >
                          {'\n' + example}
                        </Markdown>
                      </Stack>

                      <Stack
                        sx={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          padding: '5px',
                          gap: '10px',
                        }}
                      >
                        <AudioPlayIcon text={example} />

                        <IconButton
                          onClick={(e) => {
                            e.stopPropagation();
                            translator.translateWithModal(example, e.currentTarget);
                          }}
                        >
                          <Languages size={'16px'} color={'rgba(255, 255, 255, 0.7)'} />
                        </IconButton>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            )}
          </Stack>
        </CustomModal>
      )}

      <Stack
        onClick={() => {
          setIsFullSize(true);
        }}
        sx={{
          width: '100%',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          padding: '0px 10px',
          alignItems: 'center',
          minHeight: rowHeight,
          justifyContent: 'space-between',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          color: '#fff',
          cursor: 'pointer',
          textAlign: 'left',
          flexDirection: 'row',
        }}
        component={'button'}
      >
        <Typography>{improvement.title}</Typography>
        <ChevronRight size={'20px'} />
      </Stack>
    </>
  );
};
