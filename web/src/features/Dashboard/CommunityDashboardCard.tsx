import { Stack, Typography } from '@mui/material';
import { RowItem, StoreCard } from '../uiKit/Card/StoreCard';
import { SectionHeader } from './CartsHeader';
import { useLingui } from '@lingui/react';
import { useRolePlay } from '../RolePlay/useRolePlay';
import { useState } from 'react';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { RolePlayBoard } from '../RolePlay/RolePlayBoard';
import { CommunityDashboard } from '../Community/CommunityDashboard';
import { useAppNavigation } from '../Navigation/useAppNavigation';

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

        <StoreCard
          textColor={'#000'}
          backgroundColor={'rgba(227, 209, 193, 0.6)'}
          previewImageUrl={
            'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1773869239010-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png'
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
      </Stack>
    </>
  );
};
