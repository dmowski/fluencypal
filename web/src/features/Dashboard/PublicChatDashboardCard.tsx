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
import { GlobalChatTabs } from '../Chat/GlobalChatTabs';
import { ChatSection } from '../Chat/ChatSection';
import { ChatPage } from '../Chat/ChatPage';

export const PublicChatDashboardCard = () => {
  const { i18n } = useLingui();
  const [isShowAll, setIsShowAll] = useUrlState('publicChat', false, false);

  const openAll = () => {
    setIsShowAll(true);
  };

  const access = useAccess();
  if (!access.canUseCommunity) {
    return <></>;
  }

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
              padding: '0',
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
                {i18n._('Community Chat')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {i18n._('Join the community chat and connect with other members!')}
              </Typography>
            </Stack>

            <ChatPage type={'public'} />
          </Stack>
        </CustomModal>
      )}

      <Stack
        sx={{
          gap: '10px',
        }}
      >
        <StoreCard
          textColor={'#fff'}
          backgroundColor={'#00000065'}
          previewImageUrl={
            'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1773964951620-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.jpg'
          }
          title={i18n._('Global Chat')}
          subTitle={i18n._('Join the global chat and connect with other members!')}
          items={[]}
          onClick={openAll}
          itemsBackgroundColor={'rgba(32, 32, 32, 1)'}
          itemsViewMode={'list'}
        />
      </Stack>
    </Stack>
  );
};
