import { Stack, Typography } from '@mui/material';
import { RowItem, StoreCard } from '../uiKit/Card/StoreCard';
import { SectionHeader } from './CartsHeader';
import { useLingui } from '@lingui/react';
import { useCommunitySpace } from '../Community/CommunitySpace/useCommunitySpace';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { useUrlState } from '../Url/useUrlState';
import { CommunityRooms } from '../Community/CommunitySpace/CommunityRooms';
import { ActiveSpacePage } from '../Community/CommunitySpace/ActiveSpacePage';

export const CommunityDashboardCard = () => {
  const { i18n } = useLingui();
  const { spaces } = useCommunitySpace();
  const [isShowCommunityRooms, setIsShowCommunityRooms] = useUrlState('showRooms', false, false);

  const [activeSpaceId, setActiveSpaceId] = useUrlState('activeSpaceId', '', false);

  const openSpace = (spaceId: string) => {
    setActiveSpaceId(spaceId);
  };
  const activeSpace = spaces.find((space) => space.id === activeSpaceId);

  const items: RowItem[] = spaces.map((space) => {
    const spaceItem: RowItem = {
      title: space.title,
      subTitle: space.description,
      onClick: () => openSpace(space.id),
      imageUrl: space.iconImageUrl || undefined,
      iconBgColor: 'rgba(155, 58, 190, 0.6)',
      actionButtonTitle: i18n._('Open'),
      iconName: space.iconImageUrl ? undefined : 'users-round',
    };

    return spaceItem;
  });

  return (
    <>
      {activeSpace && (
        <CustomModal
          isOpen={true}
          onClose={() => {
            setActiveSpaceId('');
          }}
          mobilePadding="40px 0"
        >
          <Stack
            sx={{
              maxWidth: '700px',

              gap: '30px',
              width: '100%',
            }}
          >
            <Stack
              sx={{
                padding: '0',
              }}
            >
              <ActiveSpacePage space={activeSpace} onClose={() => setActiveSpaceId('')} />
            </Stack>
          </Stack>
        </CustomModal>
      )}

      {isShowCommunityRooms && (
        <CustomModal
          isOpen={true}
          onClose={() => setIsShowCommunityRooms(false)}
          mobilePadding="40px 0"
        >
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
                {i18n._('Community Rooms')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {i18n._('Join rooms to discuss specific topics with other members')}
              </Typography>
            </Stack>

            <CommunityRooms
              openSpaceId={(spaceId) => {
                openSpace(spaceId);
              }}
            />
          </Stack>
        </CustomModal>
      )}

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
            setIsShowCommunityRooms(true);
          }}
          itemsViewMode={'list'}
        />
      </Stack>
    </>
  );
};
