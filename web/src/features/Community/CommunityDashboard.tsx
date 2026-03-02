'use client';

import { Stack, Typography } from '@mui/material';
import { NavigationBar } from '../Navigation/NavigationBar';
import { Crown, Mail, MessagesSquare, Swords, UsersRound } from 'lucide-react';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { useUrlState } from '../Url/useUrlState';
import { CommunityCard } from './CommunityCard';
import { CommunityPageRouter } from './CommunityPage';
import { CommunityPage, CommunitySpace } from './types';
import { useChatList } from '../Chat/useChatList';
import { useLingui } from '@lingui/react';
import { useBattle } from '../Game/Battle/useBattle';
import { DashboardBlur } from '../Dashboard/DashboardBlur';
import { useAccess } from '../Usage/useAccess';
import { useCommunitySpace } from './CommunitySpace/useCommunitySpace';
import { ActiveSpacePage } from './CommunitySpace/ActiveSpacePage';
import { CommunityRooms } from './CommunitySpace/CommunityRooms';

export const CommunityDashboard = () => {
  const chatList = useChatList();
  const { i18n } = useLingui();
  const battles = useBattle();
  const access = useAccess();
  const { spaces } = useCommunitySpace();

  const [activePage, setActivePage] = useUrlState<CommunityPage | ''>('section', '', true);
  const [activeSpace, setActiveSpace] = useUrlState<string>('space', '', true);

  const activeSpaceData = spaces.find((r) => r.id === activeSpace);

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
          {activeSpace ? (
            <ActiveSpacePage space={activeSpaceData!} onClose={() => setActiveSpace('')} />
          ) : activePage ? (
            <CommunityPageRouter activePage={activePage} onClose={() => setActivePage('')} />
          ) : (
            <Stack
              sx={{
                padding: '20px',
                gap: '80px',
                '--icon-size': '40px',
                paddingBottom: '100px',
                '@media (max-width: 600px)': {
                  padding: '20px 0 100px 0',
                  '--icon-size': '30px',
                },
              }}
            >
              <Stack
                sx={{
                  gap: '20px',
                }}
              >
                <Stack>
                  <Typography
                    variant="h3"
                    sx={{
                      paddingLeft: '5px',
                      fontWeight: 800,
                    }}
                  >
                    {i18n._('Community Hub')}
                  </Typography>
                  <Typography
                    sx={{
                      paddingLeft: '5px',
                    }}
                  >
                    {i18n._(
                      'Explore the community, join discussions, and connect with other members',
                    )}
                  </Typography>
                </Stack>

                <Stack
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',

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
                  {access.canUseCommunity && (
                    <CommunityCard
                      title={i18n._('Community Chat')}
                      onClick={() => setActivePage('chat')}
                      badgeNumber={chatList.unreadCountGlobal}
                      icon={<MessagesSquare style={iconStyle} />}
                    />
                  )}
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

                  {access.canUseCommunity && (
                    <CommunityCard
                      title={i18n._('Debates')}
                      badgeNumber={battles.countOfBattlesNeedToAttention}
                      onClick={() => setActivePage('debates')}
                      icon={<UsersRound style={iconStyle} />}
                    />
                  )}

                  {access.canUseCommunity && (
                    <CommunityCard
                      title={i18n._('Daily Questions')}
                      onClick={() => setActivePage('daily-questions')}
                      icon={<PsychologyIcon style={iconStyle} />}
                    />
                  )}

                  <CommunityCard
                    title={i18n._('Leaderboards')}
                    onClick={() => setActivePage('leaderboards')}
                    icon={<Crown style={iconStyle} />}
                  />

                  {access.canUseCommunity && (
                    <CommunityCard
                      title={i18n._('Private Messages')}
                      onClick={() => setActivePage('dm')}
                      badgeNumber={chatList.myUnreadCount}
                      icon={<Mail style={iconStyle} />}
                    />
                  )}
                </Stack>
              </Stack>

              {access.canAccessSpaces && <CommunityRooms openSpaceId={setActiveSpace} />}
            </Stack>
          )}
        </Stack>

        <DashboardBlur />
      </Stack>
    </>
  );
};
