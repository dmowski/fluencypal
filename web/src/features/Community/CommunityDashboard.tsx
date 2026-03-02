'use client';

import { Badge, Button, IconButton, Stack, Typography } from '@mui/material';
import { NavigationBar } from '../Navigation/NavigationBar';
import {
  ArrowLeft,
  CirclePlus,
  Crown,
  Mail,
  MessagesSquare,
  Newspaper,
  Origami,
  Swords,
  UsersRound,
} from 'lucide-react';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { useUrlState } from '../Url/useUrlState';
import { CommunityCard } from './CommunityCard';
import { CommunityPageRouter } from './CommunityPage';
import { CommunityPage, Room } from './types';
import { useChatList } from '../Chat/useChatList';
import { useLingui } from '@lingui/react';
import { useBattle } from '../Game/Battle/useBattle';
import { DashboardBlur } from '../Dashboard/DashboardBlur';
import { AccessBadge } from '../Dashboard/AccessBadge';
import { useAccess } from '../Usage/useAccess';
import { useCommunityRoom } from './useCommunityRoom';
import { DynamicIcon } from 'lucide-react/dynamic';
import { useAuth } from '../Auth/useAuth';
import { useGame } from '../Game/useGame';
import { ChartSortMode } from '../Chat/type';
import { sleep } from '@/libs/sleep';
import { ChatProvider, useChat } from '../Chat/useChat';
import { GlobalChatTabs } from '../Chat/GlobalChatTabs';
import { ChatSection } from '../Chat/ChatSection';

export const CommunityDashboard = () => {
  const chatList = useChatList();
  const { i18n } = useLingui();
  const battles = useBattle();
  const access = useAccess();
  const auth = useAuth();
  const { rooms } = useCommunityRoom();

  const [activePage, setActivePage] = useUrlState<CommunityPage | ''>('section', '', true);
  const [activeRoom, setActiveRoom] = useUrlState<string>('room', '', true);

  const activeRoomData = rooms.find((r) => r.id === activeRoom);

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
          {activeRoom ? (
            <ActiveRoomPage room={activeRoomData!} onClose={() => setActiveRoom('')} />
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

              {auth.isFounder && <CommunityRooms openRoomId={setActiveRoom} />}
            </Stack>
          )}
        </Stack>

        <DashboardBlur />
      </Stack>
    </>
  );
};

export const ActiveRoomPage = ({ room, onClose }: { room: Room; onClose: () => void }) => {
  const { i18n } = useLingui();
  const { rooms } = useCommunityRoom();

  const title = room.title;

  const [activeChatPost] = useUrlState<string | null>('post', null, false);
  const [activeChatId] = useUrlState<string | null>('activeChatId', null, false);

  const titles: Record<CommunityPage, string> = {
    chat: i18n._('Community Chat'),
    game: i18n._('Game'),
    dm: i18n._('Private Messages'),
    debates: i18n._('Debates'),
    'daily-questions': i18n._('Daily Questions'),
    'tech-support': i18n._('Tech Support'),
    leaderboards: i18n._('Leaderboards'),
  };

  const isShowHeader = !activeChatPost && !activeChatId;

  return (
    <Stack>
      {isShowHeader && (
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
          <Typography variant="body2">{title}</Typography>
        </Stack>
      )}

      <Stack
        sx={{
          paddingTop: isShowHeader ? '20px' : 0,
          paddingBottom: '100px',
        }}
      >
        <RoomChatPage room={room} />
      </Stack>
    </Stack>
  );
};

const RoomChatPage = ({ room }: { room: Room }) => {
  const access = useAccess();

  const { i18n } = useLingui();
  const auth = useAuth();
  const game = useGame();

  const [activeChatId, setActiveChatId] = useUrlState<string>('activeChatId', '', false);
  const [activePost, setActivePost] = useUrlState<string>('post', '', true);
  const chatList = useChatList();

  const [sortMode, setSortMode] = useUrlState<ChartSortMode>('chatSortMode', 'all', false);
  const changePage = (newPage: ChartSortMode) => {
    setSortMode(newPage);
    if (activePost) {
      setTimeout(() => setActivePost(''), 90);
    } else {
    }
  };

  const chatMetadata = chatList.myChats.find((chat) => chat.spaceId === activeChatId);

  const activeChatBgImage =
    game.gameAvatars[
      chatMetadata?.allowedUserIds?.sort((a, b) => {
        // my id last
        if (a === auth.uid) return 1;
        if (b === auth.uid) return -1;
        return 0;
      })?.[0] || ''
    ];

  const back = async () => {
    setActiveChatId('');
    await sleep(150);
    setActivePost('');
  };

  if (!access.canUseCommunity) {
    return <></>;
  }

  return (
    <RoomProvider room={room}>
      <Stack
        sx={{
          width: '100%',
        }}
      >
        <GlobalChatTabs sortMode={sortMode} setSortMode={changePage} />
        <ChatSection contextForAiAnalysis="" isFullContentByDefault={false} sortMode={sortMode} />
      </Stack>
    </RoomProvider>
  );
};

const RoomProvider = ({ room, children }: { room: Room; children: React.ReactNode }) => {
  return (
    <ChatProvider
      metadata={{
        spaceId: 'room-' + room.id,
        allowedUserIds: null,
        isPrivate: false,
        type: 'room',
      }}
    >
      {children}
    </ChatProvider>
  );
};

export const CommunityRooms = ({ openRoomId }: { openRoomId: (roomId: string) => void }) => {
  const { i18n } = useLingui();
  const { rooms } = useCommunityRoom();

  return (
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
          {i18n._('Spaces')}
        </Typography>
        <Typography
          sx={{
            paddingLeft: '5px',
          }}
        >
          {i18n._('Join spaces to discuss specific topics with other members')}
        </Typography>
      </Stack>

      <Stack
        sx={{
          gap: '20px',
          alignItems: 'center',
        }}
      >
        {rooms.map((room) => (
          <RoomProvider key={room.id} room={room}>
            <RoomButton room={room} openRoomId={openRoomId} />
          </RoomProvider>
        ))}

        <Button
          startIcon={<CirclePlus />}
          variant="outlined"
          color="info"
          sx={{
            marginTop: '10px',
            padding: '10px 30px',
          }}
        >
          {i18n._('Create New Space')}
        </Button>
      </Stack>
    </Stack>
  );
};

export const RoomButton = ({
  room,
  openRoomId,
}: {
  room: Room;
  openRoomId: (roomId: string) => void;
}) => {
  const chatList = useChat();
  const unreadCount = chatList.unreadMessagesCount;

  return (
    <Stack
      key={room.id}
      component={'button'}
      onClick={() => openRoomId(room.id)}
      sx={{
        textAlign: 'left',
        width: '100%',
        color: '#fff',
        borderRadius: '8px',
        padding: '15px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backgroundColor: '#111',
        cursor: 'pointer',
      }}
    >
      <Badge badgeContent={unreadCount} color="error">
        <Typography
          variant="h5"
          component={'span'}
          sx={{
            fontWeight: 700,
          }}
        >
          {room.title}
        </Typography>
      </Badge>
      <Typography sx={{ opacity: 0.9 }}>{room.description}</Typography>
    </Stack>
  );
};
