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
import { useUrlState } from '../Url/useUrlParam';
import { CommunityCard } from './CommunityCard';
import { CommunityPageRouter } from './CommunityPage';
import { CommunityPage } from './types';
import { useChatList } from '../Chat/useChatList';
import { useLingui } from '@lingui/react';
import { useBattle } from '../Game/Battle/useBattle';

export const CommunityDashboard = () => {
  const iconFontSize = '40px';

  const chatList = useChatList();
  const { i18n } = useLingui();
  const battles = useBattle();

  const [activePage, setActivePage] = useUrlState<CommunityPage | ''>('section', '', false);

  return (
    <>
      <NavigationBar />
      <Stack
        sx={{
          alignItems: 'center',
          width: '100%',
        }}
      >
        <Stack sx={{ width: '100%', maxWidth: '680px' }}>
          {activePage ? (
            <CommunityPageRouter activePage={activePage} onClose={() => setActivePage('')} />
          ) : (
            <Stack sx={{ padding: '20px', gap: '20px' }}>
              <Typography variant="body2">{i18n._('Community Hub')}</Typography>

              <Stack
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  paddingBottom: '100px',
                  gap: '20px',

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
                  badgeNumber={chatList.unreadCountGlobal}
                  icon={<MessagesSquare size={iconFontSize} />}
                />
                <CommunityCard
                  title="Game"
                  onClick={() => setActivePage('game')}
                  badgeNumber={0}
                  icon={<Swords size={iconFontSize} />}
                />

                <CommunityCard
                  title="Tech Support"
                  onClick={() => setActivePage('tech-support')}
                  icon={<SupportAgentIcon sx={{ fontSize: '60px' }} />}
                />
                <CommunityCard
                  title="Private Chat"
                  onClick={() => setActivePage('dm')}
                  badgeNumber={chatList.myUnreadCount}
                  icon={<MessageCircle size={iconFontSize} />}
                />
                <CommunityCard
                  title="Debates"
                  badgeNumber={battles.countOfBattlesNeedToAttention}
                  onClick={() => setActivePage('debates')}
                  icon={<UsersRound size={iconFontSize} />}
                />

                {/*
              <CommunityCard
                title="Daily Questions"
                onClick={() => setActivePage('daily-questions')}
                icon={<PsychologyIcon sx={{ fontSize: '60px' }} />}
              />
              */}

                <CommunityCard
                  title="Leaderboards"
                  onClick={() => setActivePage('leaderboards')}
                  icon={<Crown size={iconFontSize} />}
                />
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>
    </>
  );
};
