import { Stack, Typography } from '@mui/material';
import { dailyQuestions } from './dailyQuestions';
import dayjs from 'dayjs';
import { useChatList } from '../Chat/useChatList';
import { DailyQuestionFullCard } from './DailyQuestionFullCard';
import { useLingui } from '@lingui/react';
import { PageContainer } from '../Community/PageContainer';

export const DailyQuestionNotificationsList = () => {
  const chatList = useChatList();
  const { i18n } = useLingui();
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
      {questions.length === 0 && (
        <PageContainer>
          <Typography variant="h6">{i18n._('No Daily Questions notifications')}</Typography>
          <Stack gap="20px">
            <Typography
              variant="body2"
              sx={{
                opacity: 0.7,
              }}
            >
              {i18n._(
                'Answer Daily Questions to get notifications about new answers and comments.',
              )}
            </Typography>
          </Stack>
        </PageContainer>
      )}
      {questions.map((question) => {
        const latestChanged = dayjs(
          dailyQuestionsNotifications.find(
            (notification) => notification.spaceId === 'daily-question-' + question.id,
          )?.latestNotMineChanges || '',
        ).fromNow();
        return (
          <DailyQuestionFullCard key={question.id} question={question} badge={latestChanged} />
        );
      })}
    </Stack>
  );
};
