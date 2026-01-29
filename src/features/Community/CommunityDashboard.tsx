'use client';

import { Badge, Stack, Typography } from '@mui/material';
import { NavigationBar } from '../Navigation/NavigationBar';
import {
  Crown,
  Mail,
  MessageCircle,
  MessagesSquare,
  ShieldQuestionMark,
  Swords,
  UsersRound,
} from 'lucide-react';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { useUrlState } from '../Url/useUrlState';
import { CommunityCard } from './CommunityCard';
import { CommunityPageRouter } from './CommunityPage';
import { CommunityPage } from './types';
import { useChatList } from '../Chat/useChatList';
import { useLingui } from '@lingui/react';
import { useBattle } from '../Game/Battle/useBattle';

export const CommunityDashboard = () => {
  const chatList = useChatList();
  const { i18n } = useLingui();
  const battles = useBattle();

  const [activePage, setActivePage] = useUrlState<CommunityPage | ''>('section', '', false);

  const iconStyle = {
    fontSize: 'var(--icon-size)',
    width: 'var(--icon-size)',
    height: 'var(--icon-size)',
  };

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
            width: '100%',
            maxWidth: '680px',
            '@media (max-width: 600px)': {
              maxWidth: '700px',
            },
          }}
        >
          {activePage ? (
            <CommunityPageRouter activePage={activePage} onClose={() => setActivePage('')} />
          ) : (
            <Stack
              sx={{
                padding: '20px',
                gap: '10px',
                '--icon-size': '40px',
                '@media (max-width: 600px)': {
                  padding: '20px 0 0 0',
                  '--icon-size': '30px',
                },
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.6,
                  paddingLeft: '5px',
                }}
              >
                {i18n._('Community Hub')}
              </Typography>

              <Stack
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  paddingBottom: '100px',
                  gap: '15px',

                  '@media (max-width: 600px)': {
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                  },
                  '@media (max-width: 320px)': {
                    gridTemplateColumns: '1fr',
                  },
                }}
              >
                <CommunityCard
                  title={i18n._('Community Chat')}
                  onClick={() => setActivePage('chat')}
                  badgeNumber={chatList.unreadCountGlobal}
                  icon={<MessagesSquare style={iconStyle} />}
                />
                <CommunityCard
                  title={i18n._('Game')}
                  onClick={() => setActivePage('game')}
                  badgeNumber={0}
                  icon={<Swords style={iconStyle} />}
                />

                <CommunityCard
                  title={i18n._('Tech Support')}
                  onClick={() => setActivePage('tech-support')}
                  icon={<SupportAgentIcon style={iconStyle} />}
                />

                <CommunityCard
                  title={i18n._('Debates')}
                  badgeNumber={battles.countOfBattlesNeedToAttention}
                  onClick={() => setActivePage('debates')}
                  icon={<UsersRound style={iconStyle} />}
                />

                <CommunityCard
                  title={i18n._('Daily Questions')}
                  onClick={() => setActivePage('daily-questions')}
                  icon={<PsychologyIcon style={iconStyle} />}
                />

                <CommunityCard
                  title={i18n._('Leaderboards')}
                  onClick={() => setActivePage('leaderboards')}
                  icon={<Crown style={iconStyle} />}
                />
                <CommunityCard
                  title={i18n._('Private Messages')}
                  onClick={() => setActivePage('dm')}
                  badgeNumber={chatList.myUnreadCount}
                  icon={<Mail style={iconStyle} />}
                />
              </Stack>
            </Stack>
          )}
        </Stack>
      </Stack>
    </>
  );
};
