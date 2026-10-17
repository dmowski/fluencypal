'use client';

import { defaultAvatar } from '@/features/Game/avatars';
import { useGame } from '@/features/Game/useGame';
import { Avatar } from '@/features/User/Avatar';

export const VoiceUserAvatar = ({
  userId,
  size,
  isOnline,
}: {
  userId: string;
  size: string;
  isOnline?: boolean;
}) => {
  const game = useGame();

  return (
    <Avatar
      url={game.getUserAvatarUrl(userId) || defaultAvatar}
      avatarSize={size}
      isOnline={isOnline}
    />
  );
};
