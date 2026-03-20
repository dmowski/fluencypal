import { useLingui } from '@lingui/react';
import { useAccess } from '../Usage/useAccess';
import { Stack, Typography } from '@mui/material';
import { StoreCard } from '../uiKit/Card/StoreCard';

import { CustomModal } from '../uiKit/Modal/CustomModal';
import { useUrlState } from '../Url/useUrlState';

import { ChatPage } from '../Chat/ChatPage';
import { PreviewCard } from '../Chat/Message/PreviewCard';

export const PublicChatDashboardCard = () => {
  const { i18n } = useLingui();
  const [isShowAll, setIsShowAll] = useUrlState('publicChat', false, false);

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
          title={i18n._('Community Chat')}
          subTitle={i18n._('Join the community chat and connect with other members!')}
          items={[]}
          onClick={() => setIsShowAll(true)}
          itemsBackgroundColor={'rgba(32, 32, 32, 1)'}
          itemsViewMode={'list'}
        />

        <PreviewCard />
      </Stack>
    </Stack>
  );
};
