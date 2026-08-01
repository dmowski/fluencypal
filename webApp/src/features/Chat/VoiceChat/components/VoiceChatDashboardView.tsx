'use client';

import { useLingui } from '@lingui/react';
import { Badge, Stack } from '@mui/material';
import { SectionHeader } from '@/features/Dashboard/CartsHeader';
import { StoreCard } from '@/features/uiKit/Card/StoreCard';
import { voiceChatUi } from '../voiceChatUi';
import {
  VoiceChatDashboardPanel,
  type VoiceChatDashboardPanelProps,
} from './VoiceChatDashboardPanel';
import { VoiceChatRulesDialog } from './VoiceChatRulesDialog';

export type VoiceChatDashboardViewProps = VoiceChatDashboardPanelProps & {
  previewImageUrl: string;
  unreadCount?: number;
  rulesOpen: boolean;
  onCloseRules: () => void;
  onCardClick?: () => void;
  rootTestId?: string;
};

export const VoiceChatDashboardView = ({
  previewImageUrl,
  unreadCount = 0,
  rulesOpen,
  onCloseRules,
  onCardClick,
  rootTestId,
  ...panelProps
}: VoiceChatDashboardViewProps) => {
  const { i18n } = useLingui();

  return (
    <Stack gap="20px" data-testid={rootTestId}>
      <SectionHeader
        title={i18n._('Voice chat with people')}
        subTitle={i18n._('A small, voice-only room. No transcripts.')}
      />
      <Badge
        color="error"
        badgeContent={unreadCount}
        invisible={!unreadCount}
        sx={{ width: '100%', '& .MuiBadge-badge': { right: 16, top: 16 } }}
      >
        <StoreCard
          textColor="#fff"
          backgroundColor={voiceChatUi.dashboardCardBg}
          previewImageUrl={previewImageUrl}
          title={i18n._('Voice chat with people')}
          subTitle={i18n._('Messages are removed after 4 days')}
          items={[]}
          itemsBackgroundColor={voiceChatUi.dashboardItemsBg}
          itemsViewMode="list"
          onClick={onCardClick}
        >
          <VoiceChatDashboardPanel {...panelProps} />
        </StoreCard>
      </Badge>

      <VoiceChatRulesDialog open={rulesOpen} onClose={onCloseRules} />
    </Stack>
  );
};
