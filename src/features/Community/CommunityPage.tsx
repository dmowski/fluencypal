import { IconButton, Stack, Typography } from '@mui/material';
import { CommunityPage } from './types';
import { useLingui } from '@lingui/react';
import { ArrowLeft } from 'lucide-react';
import { ChatPage } from '../Chat/ChatPage';
import { GameStats } from '../Game/GameStats';
import { GamePage } from './GamePage';
import { DebatesPage } from './DebatesPage';
import { DailyQuestionBadge } from '../Game/DailyQuestion/DailyQuestionBadge';
import { SupportPage } from './SupportPage';
import { PageContainer } from './PageContainer';

export const CommunityPageRouter = ({
  activePage,
  onClose,
}: {
  activePage: CommunityPage;
  onClose: () => void;
}) => {
  const { i18n } = useLingui();
  const titles: Record<CommunityPage, string> = {
    chat: i18n._('Community Chat'),
    game: i18n._('Game'),
    dm: i18n._('Private Messages'),
    debates: i18n._('Debates'),
    'daily-questions': i18n._('Daily Questions'),
    'tech-support': i18n._('Tech Support'),
    leaderboards: i18n._('Leaderboards'),
  };

  return (
    <Stack>
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingTop: '10px',

          gap: '10px',
        }}
        onClick={onClose}
      >
        <IconButton
          sx={{
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <ArrowLeft size={'18px'} />
        </IconButton>
        <Typography variant="body2">{titles[activePage]}</Typography>
      </Stack>

      <Stack
        sx={{
          paddingTop: '20px',
          paddingBottom: '100px',
        }}
      >
        <CommunityPageContent activePage={activePage} />
      </Stack>
    </Stack>
  );
};

const CommunityPageContent = ({ activePage }: { activePage: CommunityPage }) => {
  if (activePage == 'chat') return <ChatPage type="public" />;
  if (activePage == 'dm') return <ChatPage type="private" isFullContentByDefault />;
  if (activePage == 'game') return <GamePage />;
  if (activePage == 'debates') return <DebatesPage />;
  if (activePage == 'daily-questions') return <DailyQuestionBadge />;
  if (activePage == 'tech-support')
    return (
      <PageContainer>
        <SupportPage />
      </PageContainer>
    );
  if (activePage == 'leaderboards') return <GameStats />;

  return <></>;
};
