import { Avatar } from '@/features/Game/Avatar';
import { useGame } from '@/features/Game/useGame';
import { useLingui } from '@lingui/react';
import { Stack, Typography } from '@mui/material';

export const FounderMessage = () => {
  const { i18n } = useLingui();

  const game = useGame();
  const founderUserId = 'Mq2HfU3KrXTjNyOpPXqHSPg5izV2';
  const founderAvatar = game.gameAvatars[founderUserId] || '';

  return (
    <Stack
      sx={{
        gap: '10px',
        paddingTop: '10px',
      }}
    >
      <Typography
        sx={{
          width: '100%',
          alignItems: 'flex-end',
          fontStyle: 'italic',
        }}
      >
        {i18n._(
          `"Don't forget if something goes wrong you have always someone to help you. If you don't like our service or something else, just let me know and I will return your money without any questions."`,
        )}
      </Typography>
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <Avatar url={founderAvatar} avatarSize="30px" />
        <Typography
          sx={{
            width: '100%',
            alignItems: 'flex-end',
            opacity: 1,
            fontSize: '16px',
            fontWeight: 500,
          }}
        >
          {i18n._('Alex Dmowski (Founder)')}
        </Typography>
      </Stack>
    </Stack>
  );
};
