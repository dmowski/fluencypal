'use client';

import { Stack } from '@mui/material';
import { type ReactNode } from 'react';
import { useGame } from '@/features/Game/useGame';
import { Avatar } from '@/features/User/Avatar';
import { UserName } from '@/features/User/UserName';

export const VoiceChatUserRow = ({
  userId,
  avatarSize = '28px',
  meta,
  trailing,
}: {
  userId: string;
  avatarSize?: string;
  meta?: ReactNode;
  trailing?: ReactNode;
}) => {
  const game = useGame();

  return (
    <Stack direction="row" alignItems="center" gap={0.75} width="100%" minWidth={0}>
      <Avatar url={game.getUserAvatarUrl(userId)} avatarSize={avatarSize} />
      <Stack direction="row" alignItems="center" gap={0.75} flex={1} minWidth={0} flexWrap="wrap">
        <UserName
          userId={userId}
          userName={game.getUserName(userId)}
          bold
          size="small"
        />
        {meta}
      </Stack>
      {trailing}
    </Stack>
  );
};
