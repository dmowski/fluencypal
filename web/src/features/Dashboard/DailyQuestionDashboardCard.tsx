import dayjs from 'dayjs';
import { useSettings } from '../Settings/useSettings';
import { dailyQuestions } from '../Game/DailyQuestion/dailyQuestions';
import { useLingui } from '@lingui/react';
import { useAccess } from '../Usage/useAccess';
import { ChatProvider } from '../Chat/useChat';
import { Stack } from '@mui/material';
import { StoreCard } from '../uiKit/Card/StoreCard';
import { FlatChat } from '../Chat/FlatChat';

export const DailyQuestionDashboardCard = () => {
  const settings = useSettings();
  const startDay = settings.userSettings?.createdAtIso || settings.userSettings?.createdAt;
  const daysSinceStart = startDay ? dayjs().diff(dayjs(startDay), 'day') : 0;
  const questionsKeys = Object.keys(dailyQuestions);
  const questionIndex = daysSinceStart % questionsKeys.length;

  const todaysQuestion = dailyQuestions[questionsKeys[questionIndex]];
  const { i18n } = useLingui();

  const access = useAccess();
  if (!access.canUseCommunity) {
    return <></>;
  }

  const spaceId = 'daily-question-' + todaysQuestion.id;
  return (
    <ChatProvider
      metadata={{
        spaceId: spaceId,
        allowedUserIds: null,
        isPrivate: false,
        type: 'dailyQuestion',
      }}
    >
      <Stack
        sx={{
          gap: '10px',
        }}
      >
        <StoreCard
          badge={i18n._('Daily Question').toUpperCase()}
          textColor={'#fff'}
          backgroundColor={'rgba(46, 43, 137, 0.9)'}
          label={i18n._('Question') + ' #' + (questionIndex + 1)}
          previewImageUrl={
            'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1773945943743-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png'
          }
          title={todaysQuestion.title}
          subTitle={todaysQuestion.description}
          items={[]}
          itemsBackgroundColor={'rgba(32, 32, 32, 0.98)'}
          itemsViewMode={'list'}
        >
          <Stack
            sx={{
              backgroundColor: 'rgba(32, 32, 32, 0.98)',
              //borderRadius: '16px',
            }}
          >
            <FlatChat />
          </Stack>
        </StoreCard>
      </Stack>
    </ChatProvider>
  );
};
