import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { dailyQuestions } from './dailyQuestions';
import dayjs from 'dayjs';
import { ColorIconTextList } from '@/features/Survey/ColorIconTextList';
import { ChatProvider } from '@/features/Chat/useChat';
import { DailyQuestion } from './types';
import { useSettings } from '@/features/Settings/useSettings';
import { useAccess } from '@/features/Usage/useAccess';
import { FlatChat } from '@/features/Chat/FlatChat';
import { useChatList } from '../Chat/useChatList';

export const DailyQuestionNotifications = () => {
  const chatList = useChatList();
  const dailyQuestionsNotifications = chatList.dailyQuestionsNotifications.sort((a, b) => {
    const aTimeIso = a.latestNotMineChanges;
    const bTimeIso = b.latestNotMineChanges;
    return bTimeIso.localeCompare(aTimeIso);
  });

  const questionIds = dailyQuestionsNotifications.map((notification) =>
    notification.spaceId.replace('daily-question-', ''),
  );
  const questionsRaw = questionIds.map((id) =>
    Object.values(dailyQuestions).find((question) => question.id === id),
  );
  const questions = questionsRaw.filter((question) => question !== undefined);

  return (
    <Stack
      sx={{
        gap: '90px',
      }}
    >
      {questions.map((question) => {
        const latestChanged = dayjs(
          dailyQuestionsNotifications.find(
            (notification) => notification.spaceId === 'daily-question-' + question.id,
          )?.latestNotMineChanges || '',
        ).fromNow();
        return (
          <DailyQuestionCard
            key={question.id}
            question={question}
            isShowFlameIcon={false}
            backgroundColor="rgba(255, 255, 255, 0.03)"
            badge={latestChanged}
          />
        );
      })}
    </Stack>
  );
};

export const DailyQuestionBadge = () => {
  const settings = useSettings();
  const { i18n } = useLingui();
  const createdAt = settings.userSettings?.createdAtIso || settings.userSettings?.createdAt;
  const daysSinceUserCreatedAccount = createdAt ? dayjs().diff(dayjs(createdAt), 'day') : 0;
  const questionsKeys = Object.keys(dailyQuestions);
  const questionIndex = daysSinceUserCreatedAccount % questionsKeys.length;

  const todaysQuestion = dailyQuestions[questionsKeys[questionIndex]];

  const access = useAccess();
  if (!access.canUseCommunity) {
    return <></>;
  }

  return (
    <Stack
      sx={{
        gap: '90px',
      }}
    >
      <DailyQuestionCard
        question={todaysQuestion}
        isShowFlameIcon={true}
        backgroundColor="rgba(115, 25, 35, 0.2)"
        badge={i18n._("Today's Question")}
      />

      {questionsKeys
        .filter((key) => key !== questionsKeys[questionIndex])
        .map((key) => {
          const question = dailyQuestions[key];
          return (
            <DailyQuestionCard
              key={question.id}
              question={question}
              isShowFlameIcon={false}
              backgroundColor="rgba(25, 88, 115, 0.2)"
              badge={i18n._('Old Question')}
            />
          );
        })}
    </Stack>
  );
};

export const DailyQuestionCard = ({
  question,
  backgroundColor,
  isShowFlameIcon,
  badge,
}: {
  question: DailyQuestion;
  backgroundColor: string;
  isShowFlameIcon: boolean;
  badge: string;
}) => {
  return (
    <Stack>
      <ChatProvider
        metadata={{
          spaceId: 'daily-question-' + question.id,
          allowedUserIds: null,
          isPrivate: false,
          type: 'dailyQuestion',
        }}
      >
        <Stack
          sx={{
            padding: '21px 20px 24px 20px',
            color: '#fff',
            textDecoration: 'none',
            maxWidth: '700px',
            borderRadius: '15px',
            width: '100%',
            height: 'auto',
            cursor: 'initial',

            background: backgroundColor,
            boxShadow: '0px 0px 0px 1px rgba(255, 255, 255, 0)',
            flexDirection: 'row',
            transition: 'all 0.3s ease',
            gap: '20px',
            alignItems: 'center',
            boxSizing: 'border-box',
            display: 'grid',
            minHeight: '120px',
            gridTemplateColumns: '1fr',
            '@media (max-width:600px)': {
              boxShadow: 'none',
              borderRadius: '0px',
              padding: '21px 0 4px 0',
            },
          }}
        >
          <Stack
            sx={{
              width: '100%',
            }}
          >
            <Stack
              sx={{
                '@media (max-width:600px)': {
                  padding: '0 15px',
                },
              }}
            >
              <Stack
                sx={{
                  width: '100%',
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  alignItems: 'center',
                  color: '#feb985ff',
                  paddingBottom: '5px',
                }}
              >
                <Stack
                  sx={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                  }}
                >
                  {isShowFlameIcon && (
                    <img
                      src="/icons/flame-icon.svg"
                      style={{
                        width: 20,
                        height: 20,
                        position: 'relative',
                        top: '-2px',
                        left: '-1px',
                      }}
                    />
                  )}
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 500,
                    }}
                  >
                    {badge}
                  </Typography>
                </Stack>
              </Stack>

              <Typography
                sx={{
                  paddingTop: '10px',
                  fontSize: '1.7rem',
                  fontWeight: 560,
                  lineHeight: 1.3,
                  '@media (max-width:600px)': {
                    fontSize: '1.5rem',
                  },
                }}
              >
                {question.title}
              </Typography>

              <Typography
                sx={{
                  paddingTop: '10px',
                  fontSize: '0.9rem',
                  fontWeight: 350,
                  lineHeight: 1.3,
                  color: '#fff',
                  opacity: 0.96,
                }}
              >
                {question.description}
              </Typography>

              <Stack
                sx={{
                  padding: '20px 0 10px 0',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                <ColorIconTextList
                  gap="8px"
                  listItems={question.hints.map((hint) => ({
                    iconColor: 'rgba(255, 255, 255, 0.9)',
                    title: hint,
                    iconName: 'lightbulb',
                  }))}
                />
              </Stack>
            </Stack>

            <Stack
              sx={{
                gap: '20px',
                padding: '40px 0 0px 0',
              }}
            >
              <FlatChat />
            </Stack>
          </Stack>
        </Stack>
      </ChatProvider>
    </Stack>
  );
};
