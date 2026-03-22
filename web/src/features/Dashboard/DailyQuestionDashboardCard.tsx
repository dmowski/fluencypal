import dayjs from 'dayjs';
import { useSettings } from '@/features//Settings/useSettings';
import { dailyQuestions } from '@/features/DailyQuestion/dailyQuestions';
import { useLingui } from '@lingui/react';
import { useAccess } from '@/features//Usage/useAccess';
import { ChatProvider } from '@/features//Chat/useChat';
import { Stack } from '@mui/material';
import { StoreCard } from '@/features//uiKit/Card/StoreCard';
import { FlatChat } from '@/features//Chat/FlatChat';
import { SectionHeader } from './CartsHeader';
import { useGlobalModals } from '@/features//Modal/useGlobalModals';
import { dailyQuestionsImages } from '../DailyQuestion/data';

export const DailyQuestionDashboardCard = () => {
  const settings = useSettings();
  const startDay = settings.userSettings?.createdAtIso || settings.userSettings?.createdAt;
  const daysSinceStart = startDay ? dayjs().diff(dayjs(startDay), 'day') : 0;
  const questionsKeys = Object.keys(dailyQuestions);
  const questionIndex = daysSinceStart % questionsKeys.length;

  const previewImageUrl = dailyQuestionsImages[questionIndex % dailyQuestionsImages.length];

  const todaysQuestion = dailyQuestions[questionsKeys[questionIndex]];
  const { i18n } = useLingui();
  const globalModals = useGlobalModals();

  const access = useAccess();
  if (!access.canUseCommunity) {
    return <></>;
  }

  const spaceId = 'daily-question-' + todaysQuestion.id;
  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <SectionHeader
        title={i18n._('Daily Question')}
        subTitle={i18n._('Answer a new question every day and see how your style improves!')}
        buttonTitle={i18n._('See All')}
        onButtonClick={globalModals.openDailyQuestions}
      />
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
            badge={i18n._('Today').toUpperCase()}
            textColor={'#fff'}
            backgroundColor={'rgba(0, 0, 0, 0.5)'}
            label={i18n._('Question') + ' #' + (questionIndex + 1)}
            previewImageUrl={previewImageUrl}
            title={todaysQuestion.title}
            subTitle={todaysQuestion.description}
            items={[]}
            onClick={globalModals.openDailyQuestions}
            itemsBackgroundColor={'rgba(32, 32, 32, 0.98)'}
            itemsViewMode={'list'}
          >
            <Stack
              sx={{
                backgroundColor: 'rgba(32, 32, 32, 0.98)',
              }}
            >
              <FlatChat />
            </Stack>
          </StoreCard>
        </Stack>
      </ChatProvider>
    </Stack>
  );
};
