import { Stack } from '@mui/material';
import { RowItem, StoreCard } from '../uiKit/Card/StoreCard';
import { SectionHeader } from './CartsHeader';
import { useLingui } from '@lingui/react';
import { useAppNavigation } from '../Navigation/useAppNavigation';
import { DailyQuestionDashboardCard } from './DailyQuestionDashboardCard';
import { useCommunitySpace } from '../Community/CommunitySpace/useCommunitySpace';
import { useRouter } from 'next/navigation';

export const CommunityDashboardCard = () => {
  const { i18n } = useLingui();
  const appNavigation = useAppNavigation();

  const { spaces, openSpace } = useCommunitySpace();

  const items: RowItem[] = spaces.map((space) => {
    const spaceItem: RowItem = {
      title: space.title,
      subTitle: space.description,
      onClick: () => openSpace(space.id),
      imageUrl: space.iconImageUrl || undefined,
      bgColor: 'rgba(155, 58, 190, 0.6)',
      actionButtonTitle: i18n._('Read'),
      iconName: space.iconImageUrl ? undefined : 'users-round',
    };

    return spaceItem;
  });

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
            textColor={'#fff'}
            backgroundColor={'rgba(125, 52, 52, 0.3)'}
            previewImageUrl={
              'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1773947337313-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png'
            }
            label={i18n._('Community').toUpperCase()}
            title={i18n._('Learn with the community')}
            items={items}
            itemsBackgroundColor={'rgba(32, 32, 32, 0.7)'}
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
