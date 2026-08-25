import { Stack } from '@mui/material';
import { GameMyAvatar } from './GameMyAvatar';
import { GameMyUsername } from './GameMyUsername';

export const GameMyIdentity = ({
  avatarSize,
  align = 'center',
}: {
  avatarSize?: string;
  align?: 'flex-start' | 'center';
}) => {
  return (
    <Stack
      data-testid="game-my-identity"
      sx={{
        alignItems: align,
        justifyContent: 'center',
        gap: '20px',
      }}
    >
      <GameMyAvatar avatarSize={avatarSize} />
      <GameMyUsername align={align} />
    </Stack>
  );
};
