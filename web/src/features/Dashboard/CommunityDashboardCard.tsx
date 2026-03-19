import { Stack } from '@mui/material';
import { StoreCard } from '../uiKit/Card/StoreCard';
import { SectionHeader } from './CartsHeader';
import { useLingui } from '@lingui/react';
import { useAppNavigation } from '../Navigation/useAppNavigation';
import { DailyQuestionDashboardCard } from './DailyQuestionDashboardCard';

export const CommunityDashboardCard = () => {
  const { i18n } = useLingui();
  const appNavigation = useAppNavigation();

  return (
    <>
      <Stack
        sx={{
          gap: '20px',
        }}
      >
        <SectionHeader
          title={i18n._('Community')}
          subTitle={i18n._(
            'Explore the community, join discussions, and connect with other members',
          )}
        />

        <Stack
          sx={{
            gap: '40px',
          }}
        >
          <StoreCard
            textColor={'#000'}
            backgroundColor={'rgba(227, 209, 193, 0.6)'}
            previewImageUrl={
              'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1773947337313-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png'
            }
            label={i18n._('Community').toUpperCase()}
            title={i18n._('Learn with the community')}
            items={[]}
            itemsBackgroundColor={'rgba(32, 32, 32, 0.98)'}
            onClick={() => {
              appNavigation.setCurrentPage('community');
            }}
            itemsViewMode={'list'}
          />

          <DailyQuestionDashboardCard />
        </Stack>
      </Stack>
    </>
  );
};
