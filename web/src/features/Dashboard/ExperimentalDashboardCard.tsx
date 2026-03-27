import { useLingui } from '@lingui/react';
import Stack from '@mui/material/Stack';

import { SectionHeader } from './CartsHeader';
import { StoreCard } from '../uiKit/Card/StoreCard';
import { useJustTalk } from '../Conversation/useJustTalk';
import { ChatProvider } from '../Chat/useChat';
import { FlatChat } from '../Chat/FlatChat';
import { useGame } from '../Game/useGame';
import { hasExperimentalDashboardAccess } from './experimentalDashboardAccess';

const REALTIME_15_MODEL = 'gpt-realtime-1.5';

export const ExperimentalDashboardCard = () => {
  const { i18n } = useLingui();
  const { startJustTalk, isCallStarting } = useJustTalk();

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
        subTitle={i18n._(
          'Early access features for a limited number of users. These features may change quickly.',
        )}
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
          label={i18n._('Experimental').toUpperCase()}
          title={i18n._('Realtime Talking & Correction')}
          subTitle={i18n._(
            'Try a newer realtime model tuned for smoother talking and faster corrections.',
          )}
          items={[
            {
              title: 'Realtime-1.5 - Just Talk',
              subTitle: i18n._('Just Talk mode with better AI behind it.'),
              iconName: 'star',
              iconBgColor: 'rgba(11, 8, 0, 0.8)',
              actionButtonTitle: isCallStarting ? i18n._('Loading...') : i18n._('Start'),
              onClick: () => startJustTalk(REALTIME_15_MODEL),
            },
          ]}
          itemsBackgroundColor={'rgba(100, 100, 100, 0)'}
          onClick={() => startJustTalk(REALTIME_15_MODEL)}
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
