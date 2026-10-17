'use client';

import { Stack } from '@mui/material';
import { defaultAvatar } from '@/features/Game/avatars';
import { useGame } from '@/features/Game/useGame';
import { Avatar } from '@/features/User/Avatar';

export const VoiceUserAvatar = ({
  userId,
  size,
  isOnline,
  onClick,
}: {
  userId: string;
  size: string;
  isOnline?: boolean;
  onClick?: () => void;
}) => {
  const game = useGame();

  return (
    <Stack
      data-testid={`voice-chat-avatar-${userId}`}
      onClick={onClick}
      sx={{ width: 'fit-content', cursor: onClick ? 'pointer' : 'default' }}
    >
      <Avatar
        url={game.getUserAvatarUrl(userId) || defaultAvatar}
        avatarSize={size}
        isOnline={isOnline}
      />
    </Stack>
  );
};
