import { useLingui } from '@lingui/react';
import Stack from '@mui/material/Stack';

import { SectionHeader } from './CartsHeader';
import { StoreCard } from '../uiKit/Card/StoreCard';
import { useJustTalk } from '../Conversation/useJustTalk';
import { ChatProvider } from '../Chat/useChat';
import { FlatChat } from '../Chat/FlatChat';
import { useGame } from '../Game/useGame';
import { hasExperimentalDashboardAccess } from './experimentalDashboardAccess';
import { useGlobalModals } from '../Modal/useGlobalModals';

export const ExperimentalDashboardCard = () => {
  const { i18n } = useLingui();
  const { startJustTalk, isCallStarting } = useJustTalk();
  const globalModals = useGlobalModals();

  const game = useGame();
  const isShowExperimentalDashboard = hasExperimentalDashboardAccess(game.myUserName);
  if (!isShowExperimentalDashboard) return null;

  return (
    <Stack
      sx={{
        gap: '20px',
      }}
    >
      <SectionHeader
        title={i18n._('Experimental Lab')}
        subTitle={i18n._('Early access features. These features may change quickly.')}
      />
      <ChatProvider
        metadata={{
          spaceId: 'experimental-dashboard',
          allowedUserIds: null,
          isPrivate: false,
          type: 'experimental',
        }}
      >
        <StoreCard
          textColor={'#fff'}
          backgroundColor={isCallStarting ? 'rgba(138, 105, 20, 0)' : 'rgba(73, 13, 192, 0.8)'}
          badge={'FOR TESTING PURPOSES'}
          previewImageUrl={
            'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1774632920465-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png'
          }
          title={i18n._('Experimental features')}
          items={[
            {
              title: i18n._('Voice to Text'),
              subTitle: i18n._('Narrate your text and check style.'),
              iconName: 'mic',
              iconBgColor: 'rgba(11, 8, 0, 0.8)',
              actionButtonTitle: i18n._('Start'),
              onClick: () => globalModals.openEssay(),
            },

            {
              title: i18n._('Book Reader'),
              subTitle: i18n._('Reader with some feature list translate words on the fly.'),
              iconName: 'book',
              iconBgColor: 'rgba(11, 8, 0, 0.8)',
              actionButtonTitle: i18n._('Start'),
              onClick: () => {
                window.open('https://app.fluencypal.com/book', '_blank');
              },
            },
          ]}
          itemsBackgroundColor={'rgba(100, 100, 100, 0)'}
          onClick={() => startJustTalk()}
          itemsViewMode={'list'}
        >
          <Stack
            sx={{
              backgroundColor: 'rgba(32, 32, 32, 0.98)',
              borderRadius: '0 0 16px 16px',
            }}
          >
            <FlatChat />
          </Stack>
        </StoreCard>
      </ChatProvider>
    </Stack>
  );
};
