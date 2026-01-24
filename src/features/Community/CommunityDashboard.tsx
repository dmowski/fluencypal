'use client';

import { Badge, Stack, Typography } from '@mui/material';
import { NavigationBar } from '../Navigation/NavigationBar';
import {
  Crown,
  MessageCircle,
  MessagesSquare,
  ShieldQuestionMark,
  Swords,
  UsersRound,
} from 'lucide-react';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { useUrlState } from '../Url/useUrlParam';
import { CommunityCard } from './CommunityCard';

type Page =
  | 'chat'
  | 'game'
  | 'dm'
  | 'rate'
  | 'debates'
  | 'daily-questions'
  | 'tech-support'
  | 'leaderboards';

export const CommunityDashboard = () => {
  const iconFontSize = '40px';

  const [activePage, setActivePage] = useUrlState<Page | ''>('section', '', false);

  return (
    <>
      <NavigationBar />
      <Stack
        sx={{
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Stack
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            paddingBottom: '100px',
            gap: '20px',
            width: '100%',
            maxWidth: '680px',
            '@media (max-width: 600px)': {
              gridTemplateColumns: '1fr 1fr',
              paddingTop: '20px',
            },
            '@media (max-width: 400px)': {
              gridTemplateColumns: '1fr',
            },
          }}
        >
          <CommunityCard
            title="Community Chat"
            onClick={() => setActivePage('chat')}
            badgeNumber={5}
            icon={<MessagesSquare size={iconFontSize} />}
          />
          <CommunityCard
            title="Game"
            onClick={() => setActivePage('game')}
            badgeNumber={0}
            icon={<Swords size={iconFontSize} />}
          />
          <CommunityCard
            title="Private Chat"
            onClick={() => setActivePage('dm')}
            badgeNumber={1}
            icon={<MessageCircle size={iconFontSize} />}
          />
          <CommunityCard
            title="Debates"
            onClick={() => setActivePage('debates')}
            icon={<UsersRound size={iconFontSize} />}
          />
          <CommunityCard
            title="Daily Questions"
            onClick={() => setActivePage('daily-questions')}
            icon={<PsychologyIcon sx={{ fontSize: '60px' }} />}
          />

          <CommunityCard
            title="Tech Support"
            onClick={() => setActivePage('tech-support')}
            icon={<SupportAgentIcon sx={{ fontSize: '60px' }} />}
          />

          <CommunityCard
            title="Leaderboards"
            onClick={() => setActivePage('leaderboards')}
            icon={<Crown size={iconFontSize} />}
          />
        </Stack>
      </Stack>
    </>
  );
};
