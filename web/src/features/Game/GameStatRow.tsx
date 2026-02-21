'use client';

import { Stack } from '@mui/material';
import { useGame } from './useGame';
import { Typography } from '@mui/material';
import { defaultAvatar } from './avatars';
import dayjs from 'dayjs';
import { UsersStat } from './types';
import { useAuth } from '../Auth/useAuth';
import { GamePointRow } from './GamePointRow';
import { Avatar } from './Avatar';
import { UserName } from '../User/UserName';

export const GameStatRow = ({
  stat,
  hidePosition,
}: {
  stat: UsersStat;
  hidePosition?: boolean;
}) => {
  const game = useGame();
  const auth = useAuth();
  const userId = auth.uid || '';
  const userName = game.userNames?.[stat.userId] || '';

  const isMe = stat.userId === userId;
  const realPosition = game.getRealPosition(stat.userId);
  const top5 = realPosition < 5;
  const lastVisit = game.gameLastVisit ? game.gameLastVisit[stat.userId] : null;
  const lastVisitAgo = lastVisit ? dayjs(lastVisit).fromNow() : null;

  const avatar = game.gameAvatars[stat.userId] || defaultAvatar;
  const isOnline = lastVisit ? dayjs().diff(dayjs(lastVisit), 'minute') < 5 : false;

  const actualPosition = realPosition + 1;

  const points = game.stats.find((s) => s.userId === stat.userId)?.points || 0;

  return (
    <>
      <Stack
        key={stat.userId}
        component={'button'}
        onClick={() => game.showUserInModal(stat.userId)}
        sx={{
          flexDirection: 'row',
          width: '100%',
          boxSizing: 'border-box',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '15px',
          padding: '0px 20px 0 1px',
          height: '54px',
          borderRadius: '12px',
          backgroundColor: isMe ? 'rgba(41, 179, 229, 0.17)' : 'rgba(255, 255, 255, 0.04)',
          border: 'none',
          textAlign: 'left',
          color: '#fff',
          cursor: 'pointer',
          ':focus': {
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(41, 179, 229, 0.5)',
            '.avatar': {
              boxShadow: '0px 0px 0px 0px rgba(41, 179, 229, 1)',
            },
          },
        }}
      >
        {hidePosition ? (
          <Stack sx={{ width: '1px' }} />
        ) : (
          <Typography
            sx={{
              fontSize: '14px',
              padding: '0 0 0 14px',
              fontVariantNumeric: 'tabular-nums',
              color: top5 ? '#70bfffff' : '#fff',
            }}
          >
            {actualPosition}
          </Typography>
        )}

        <Avatar avatarSize={'35px'} url={avatar} isOnline={isOnline} />

        <Stack
          sx={{
            width: '100%',
            padding: '0',
            height: '100%',
            overflow: 'hidden',
            paddingTop: '2px',
            gap: '2px',
            justifyContent: 'center',
          }}
        >
          <UserName userId={stat.userId} userName={userName} />

          <Stack
            sx={{
              flexDirection: 'row',
              gap: '20px',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                opacity: 0.6,
                lineHeight: '1',
              }}
            >
              {lastVisitAgo}
            </Typography>
          </Stack>
        </Stack>

        <GamePointRow points={points} isTop={top5} />
      </Stack>
    </>
  );
};
