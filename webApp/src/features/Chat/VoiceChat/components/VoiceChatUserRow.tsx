'use client';

import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';
import { type ReactNode } from 'react';
import { useGame } from '@/features/Game/useGame';
import { Avatar } from '@/features/User/Avatar';
import { UserName } from '@/features/User/UserName';
import { isVoiceChatUserOnline } from '../isVoiceChatUserOnline';
import { voiceChatUi } from '../voiceChatUi';

export const VoiceChatUserRow = ({
  userId,
  avatarSize = '28px',
  meta,
  trailing,
  showOnlineLabel = false,
}: {
  userId: string;
  avatarSize?: string;
  meta?: ReactNode;
  trailing?: ReactNode;
  showOnlineLabel?: boolean;
}) => {
  const { i18n } = useLingui();
  const game = useGame();
  const lastVisit = game.gameLastVisit?.[userId] ?? null;
  const isOnline = isVoiceChatUserOnline(lastVisit);

  return (
    <Stack direction="row" alignItems="center" gap={1.25} width="100%" minWidth={0}>
      <Avatar url={game.getUserAvatarUrl(userId)} avatarSize={avatarSize} isOnline={isOnline} />
      <Stack flex={1} minWidth={0} gap="2px" justifyContent="center">
        <UserName
          userId={userId}
          userName={game.getUserName(userId)}
          bold
          size="small"
        />
        {meta}
        {showOnlineLabel && isOnline && (
          <Typography variant="caption" sx={{ color: voiceChatUi.success, lineHeight: 1 }}>
            {i18n._('Online')}
          </Typography>
        )}
      </Stack>
      {trailing}
    </Stack>
  );
};
