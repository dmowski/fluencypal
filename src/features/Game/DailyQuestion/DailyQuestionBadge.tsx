import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { useMemo, useState } from 'react';
import { dailyQuestions } from './dailyQuestions';
import dayjs from 'dayjs';
import { ColorIconTextList } from '@/features/Survey/ColorIconTextList';
import { ChatSection } from '@/features/Chat/ChatSection';
import { ChatProvider, useChat } from '@/features/Chat/useChat';
import { DailyQuestion } from './types';
import { PageContainer } from '@/features/Community/PageContainer';
import { useSettings } from '@/features/Settings/useSettings';

export const DailyQuestionBadge = () => {
  const settings = useSettings();
  const createdAt = settings.userSettings?.createdAtIso || settings.userSettings?.createdAt;
  const daysSinceUserCreatedAccount = createdAt ? dayjs().diff(dayjs(createdAt), 'day') : 0;
  const questionsKeys = Object.keys(dailyQuestions);
  const questionIndex = daysSinceUserCreatedAccount % questionsKeys.length;

  const todaysQuestion = dailyQuestions[questionsKeys[questionIndex]];
  const questionId = todaysQuestion?.id;
  const { i18n } = useLingui();

  if (!todaysQuestion) {
    return (
      <PageContainer>
        <Stack
          sx={{
            gap: '5px',
          }}
        >
          <Typography variant="h6">{i18n._('No daily question for today')}</Typography>
          <Typography variant="body2">
            {i18n._(
              'Sorry, there is no daily question available for today. Please check back tomorrow!',
            )}
          </Typography>
        </Stack>
      </PageContainer>
    );
  }

  return (
    <ChatProvider
      metadata={{
        spaceId: 'daily-question-' + questionId,
        allowedUserIds: null,
        isPrivate: false,
        type: 'dailyQuestion',
      }}
    >
      <DailyQuestionBadgeComponent todaysQuestion={todaysQuestion} />
    </ChatProvider>
  );
};

export const DailyQuestionBadgeComponent = ({
  todaysQuestion,
}: {
  todaysQuestion: DailyQuestion;
}) => {
  const { i18n } = useLingui();
  const todayIsoDate = dayjs().format('YYYY-MM-DD');

  const now = useMemo(() => new Date(), []);
  const timeLeft = dayjs(todayIsoDate).endOf('day').diff(now);
  const hoursLeft = Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60)));

  const [isOpen, setIsOpen] = useState(true);

  const onToggleView = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(!isOpen);
  };

  const chat = useChat();
  const commentsCount = chat.messages.length;
  const unreadComments = chat.unreadMessagesCount || 0;

  const content = (
    <>
      <Typography
        sx={{
          paddingTop: '10px',
          fontSize: '1.7rem',
          fontWeight: 560,
          lineHeight: 1.2,
          '@media (max-width:600px)': {
            fontSize: '1.5rem',
          },
        }}
      >
        {todaysQuestion.title}
      </Typography>

      <Typography
        sx={{
          paddingTop: '5px',
          fontSize: '0.9rem',
          fontWeight: 350,
          lineHeight: 1.2,
          color: '#fff',
          opacity: 0.96,
        }}
      >
        {todaysQuestion.description}
      </Typography>

      {isOpen && (
        <Stack>
          <Stack
            sx={{
              gap: '0px',
              paddingTop: '20px',
            }}
          >
            <ColorIconTextList
              listItems={todaysQuestion.hints.map((hint) => ({
                title: hint,
                iconName: 'lightbulb',
              }))}
              iconSize={'20px'}
              gap="10px"
            />
          </Stack>
        </Stack>
      )}
    </>
  );

  return (
    <Stack
      key={todayIsoDate}
      sx={{
        padding: '21px 20px 24px 20px',
        color: '#fff',
        textDecoration: 'none',
        maxWidth: '700px',
        borderRadius: '15px',
        width: '100%',
        height: 'auto',
        cursor: isOpen ? 'initial' : 'pointer',

        background: isOpen ? 'rgba(115, 25, 35, 0.2)' : 'rgba(115, 25, 35, 0.31)',
        boxShadow: isOpen
          ? '0px 0px 0px 1px rgba(255, 255, 255, 0.2)'
          : '0px 0px 0px 1px rgba(255, 255, 255, 0.031)',
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
            width: '100%',
            justifyContent: 'space-between',
            flexDirection: 'row',
            alignItems: 'center',
            color: '#feb985ff',
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
            <Typography
              variant="body2"
              sx={{
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              {i18n._('Daily Question')}
            </Typography>
          </Stack>
          <Typography
            variant="body2"
            sx={{
              color: '#faae98',
            }}
          >
            {hoursLeft}h left
          </Typography>
        </Stack>

        {content}

        {isOpen && (
          <Stack
            sx={{
              gap: '10px',
              padding: '40px 0 20px 0',
            }}
          >
            <Stack>
              <Typography variant="h6">{i18n._(`Community Responses:`)}</Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.7,
                }}
              >
                {i18n._(`You can discuss the daily question here.`)}
              </Typography>
            </Stack>

            <ChatSection
              placeholder={i18n._('What do you think?')}
              titleContent={<Stack>{content}</Stack>}
              contextForAiAnalysis={todaysQuestion.title + '. ' + todaysQuestion.description}
              addNewPostButtonText={i18n._('Add Response')}
            />
          </Stack>
        )}
      </Stack>
    </Stack>
  );
};
