import { useLingui } from '@lingui/react';
import { useAccess } from '../Usage/useAccess';
import { Stack } from '@mui/material';
import { StoreCard } from '../uiKit/Card/StoreCard';
import { useGlobalModals } from '../Modal/useGlobalModals';
import { SectionHeader } from './CartsHeader';

export const PublicChatDashboardCard = () => {
  const { i18n } = useLingui();
  const access = useAccess();
  const { openPublicChat } = useGlobalModals();

  const openPublicChatWrapper = () => {
    openPublicChat();
  };

  if (!access.canUseCommunity) {
    return <></>;
  }

  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <SectionHeader
        title={i18n._('Community')}
        subTitle={i18n._('Explore the community, join discussions, and share your feedback!')}
      />

      <Stack
        sx={{
          gap: '10px',
        }}
      >
        <StoreCard
          textColor={'#fff'}
          backgroundColor={'rgba(32, 32, 32, 0)'}
          previewImageUrl={
            'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1773964951620-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.jpg'
          }
          title={i18n._('Place to share your thoughts')}
          items={[]}
          onClick={openPublicChatWrapper}
          itemsBackgroundColor={'rgba(32, 32, 32, 1)'}
          itemsViewMode={'list'}
        />
      </Stack>
    </Stack>
  );
};
