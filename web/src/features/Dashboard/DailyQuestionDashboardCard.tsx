import dayjs from 'dayjs';
import { useSettings } from '../Settings/useSettings';
import { dailyQuestions } from '../Game/DailyQuestion/dailyQuestions';
import { useLingui } from '@lingui/react';
import { useAccess } from '../Usage/useAccess';
import { ChatProvider } from '../Chat/useChat';
import { Stack, Typography } from '@mui/material';
import { StoreCard } from '../uiKit/Card/StoreCard';
import { FlatChat } from '../Chat/FlatChat';
import { SectionHeader } from './CartsHeader';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { DailyQuestionBadge } from '../Game/DailyQuestion/DailyQuestionBadge';
import { useUrlState } from '../Url/useUrlState';

export const DailyQuestionDashboardCard = () => {
  const settings = useSettings();
  const startDay = settings.userSettings?.createdAtIso || settings.userSettings?.createdAt;
  const daysSinceStart = startDay ? dayjs().diff(dayjs(startDay), 'day') : 0;
  const questionsKeys = Object.keys(dailyQuestions);
  const questionIndex = daysSinceStart % questionsKeys.length;

  const todaysQuestion = dailyQuestions[questionsKeys[questionIndex]];
  const { i18n } = useLingui();
  const [isShowAll, setIsShowAll] = useUrlState('dailyQuestions', false, false);

  const openAll = () => {
    setIsShowAll(true);
  };

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
      {isShowAll && (
        <CustomModal isOpen={true} onClose={() => setIsShowAll(false)} mobilePadding="40px 0">
          <Stack
            sx={{
              maxWidth: '700px',

              gap: '30px',
              width: '100%',
            }}
          >
            <Stack
              sx={{
                padding: '0 10px',
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                }}
              >
                {i18n._('Daily Questions')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {i18n._('Answer a new question every day and see how your style improves!')}
              </Typography>
            </Stack>

            <DailyQuestionBadge />
          </Stack>
        </CustomModal>
      )}

      <SectionHeader
        title={i18n._('Daily Question')}
        subTitle={i18n._('Answer a new question every day and see how your style improves!')}
        buttonTitle={i18n._('See All')}
        onButtonClick={openAll}
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
            backgroundColor={'#00000065'}
            label={i18n._('Question') + ' #' + (questionIndex + 1)}
            previewImageUrl={
              'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1773947976503-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png'
            }
            title={todaysQuestion.title}
            subTitle={todaysQuestion.description}
            items={[]}
            onClick={openAll}
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
    </Stack>
  );
};
