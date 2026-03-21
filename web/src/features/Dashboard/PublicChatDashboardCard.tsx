import { useLingui } from '@lingui/react';
import { useAccess } from '../Usage/useAccess';
import { Stack } from '@mui/material';
import { StoreCard } from '../uiKit/Card/StoreCard';
import { PreviewCard } from '../Chat/Message/PreviewCard';
import { useRouter } from 'next/navigation';
import { sleep } from '@/libs/sleep';
import { useGlobalModals } from '../Modal/useGlobalModals';

export const PublicChatDashboardCard = () => {
  const { i18n } = useLingui();
  const { openPublicChat } = useGlobalModals();

  const router = useRouter();

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
          onClick={openPublicChat}
          itemsBackgroundColor={'rgba(32, 32, 32, 1)'}
          itemsViewMode={'list'}
        />

        <PreviewCard />
      </Stack>
    </Stack>
  );
};
