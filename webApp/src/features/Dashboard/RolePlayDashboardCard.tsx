import { Stack, Typography } from '@mui/material';
import { CardItem, StoreCard } from '../uiKit/Card/StoreCard';
import { SectionHeader } from './CartsHeader';
import { useLingui } from '@lingui/react';
import { useRolePlay } from '../RolePlay/useRolePlay';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { RolePlayBoard } from '../RolePlay/RolePlayBoard';
import { useUrlState } from '../Url/useUrlState';
import { useMemo } from 'react';

export const RolePlayDashboardCard = () => {
  const { i18n } = useLingui();
  const { visibleScenarios, selectScenario } = useRolePlay();

  const [isShowAll, setIsShowAll] = useUrlState('rolePlayScenarios', false, false);

  const items: CardItem[] = visibleScenarios
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
        <CustomModal isOpen={true} onClose={() => setIsShowAll(false)} mobilePadding="0">
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
          textColor={'#fff'}
          backgroundColor={'rgba(210, 78, 42, 0.11)'}
          previewImageUrl={
            'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1783894957124-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png'
          }
          label={i18n._('Get creative').toUpperCase()}
          title={i18n._('Try these role-plays')}
          items={items}
          itemsBackgroundColor={'rgba(32, 32, 32, 0.88)'}
          onClick={() => {
            setIsShowAll(true);
          }}
          itemsViewMode={'list'}
        />
      </Stack>
    </>
  );
};

export const PracticeCustomConversationsDashboardCard = () => {
  const { i18n } = useLingui();
  const { visibleScenarios, selectScenario } = useRolePlay();

  const customScenario = useMemo(() => {
    return visibleScenarios.find((s) => s.id === 'custom-conversation');
  }, [visibleScenarios]);

  if (!customScenario) return <></>;

  return (
    <StoreCard
      textColor={'#fff'}
      backgroundColor={'rgba(63, 62, 61, 0.1)'}
      previewImageUrl={
        'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1776513009167-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png'
      }
      label={i18n._(`The sign you've been waiting for`)}
      title={customScenario.title}
      items={[]}
      itemsBackgroundColor={'rgba(32, 32, 32, 0.88)'}
      onClick={() => selectScenario(customScenario)}
      itemsViewMode={'list'}
    />
  );
};
