import { Stack } from '@mui/material';
import { dailyQuestions } from './dailyQuestions';
import dayjs from 'dayjs';
import { useChatList } from '../Chat/useChatList';
import { DailyQuestionFullCard } from './DailyQuestionFullCard';

export const DailyQuestionNotificationsList = () => {
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
          <DailyQuestionFullCard
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
