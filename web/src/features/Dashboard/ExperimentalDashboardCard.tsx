import { useLingui } from '@lingui/react';
import Stack from '@mui/material/Stack';

import { SectionHeader } from './CartsHeader';
import { StoreCard } from '../uiKit/Card/StoreCard';
import { useJustTalk } from '../Conversation/useJustTalk';

const REALTIME_15_MODEL = 'gpt-realtime-1.5';

export const ExperimentalDashboardCard = () => {
  const { i18n } = useLingui();
  const { startJustTalk, isCallStarting } = useJustTalk();

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

      <StoreCard
        textColor={'#fff'}
        backgroundColor={isCallStarting ? 'rgba(138, 105, 20, 0.6)' : 'rgba(10, 74, 123, 0.8)'}
        borderSize="3px"
        badge={'EXPERIMENTAL'}
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
            title: i18n._('Realtime-1.5'),
            subTitle: i18n._('New realtime voice model'),
            iconName: 'star',
            iconBgColor: 'rgba(11, 8, 0, 0.8)',
            actionButtonTitle: isCallStarting ? i18n._('Loading...') : i18n._('Start'),
            onClick: () => {
              startJustTalk(REALTIME_15_MODEL);
            },
          },
        ]}
        itemsBackgroundColor={'rgba(100, 100, 100, 0.0)'}
        onClick={() => {
          startJustTalk(REALTIME_15_MODEL);
        }}
        itemsViewMode={'list'}
      ></StoreCard>
    </Stack>
  );
};
