import { Stack, Typography } from '@mui/material';
import { RowItem, StoreCard } from '../uiKit/Card/StoreCard';
import { SectionHeader } from './CartsHeader';
import { useLingui } from '@lingui/react';
import { useRolePlay } from '../RolePlay/useRolePlay';
import { useState } from 'react';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { RolePlayBoard } from '../RolePlay/RolePlayBoard';

export const RolePlayDashboardCard = () => {
  const { i18n } = useLingui();
  const { visibleScenarios, selectScenario } = useRolePlay();

  const [isShowAll, setIsShowAll] = useState(false);

  const items: RowItem[] = visibleScenarios
    .filter((s, index) => index < 4)
    .map((scenario) => ({
      id: scenario.id,
      title: scenario.shortTitle,
      subTitle: scenario.title,
      imageUrl: scenario.imageSrc,
      actionButtonTitle: i18n._('Open'),
      onClick: () => selectScenario(scenario),
    }));

  return (
    <>
      {isShowAll && (
        <CustomModal isOpen={true} onClose={() => setIsShowAll(false)}>
          <Stack
            sx={{
              maxWidth: '700px',
              padding: '0 10px',
              gap: '30px',
              width: '100%',
            }}
          >
            <Stack>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                }}
              >
                {i18n._('Role-Play Scenarios')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {i18n._('Practice real-life conversations with various role-play scenarios.')}
              </Typography>
            </Stack>

            <RolePlayBoard />
          </Stack>
        </CustomModal>
      )}

      <Stack
        sx={{
          gap: '20px',
        }}
      >
        <SectionHeader
          title={i18n._('Role Play')}
          subTitle={i18n._('Practice Real-Life Conversations With Role-Play Scenarios')}
          buttonTitle={i18n._('See all')}
          onButtonClick={() => setIsShowAll(true)}
        />

        <StoreCard
          textColor={'#000'}
          backgroundColor={'rgba(227, 209, 193, 0.6)'}
          previewImageUrl={
            'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1773868292032-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png'
          }
          label={i18n._('Get creative').toUpperCase()}
          title={i18n._('Try these role-plays')}
          items={items}
          itemsBackgroundColor={'rgba(32, 32, 32, 0.98)'}
          onClick={() => {
            setIsShowAll((prev) => !prev);
          }}
          itemsViewMode={'list'}
        />
      </Stack>
    </>
  );
};
