import { useLingui } from '@lingui/react';
import { Stack, Typography, Button } from '@mui/material';
import { useAuth } from '../Auth/useAuth';
import { useGame } from '../Game/useGame';
import { useChat } from './useChat';
import { Avatar } from '../Game/Avatar';
import AddIcon from '@mui/icons-material/Add';

export const ChatSectionHeader = ({
  setIsNewPostModalOpen,
  placeholder,
  addNewPostButtonText,
}: {
  setIsNewPostModalOpen: (isOpen: boolean) => void;
  placeholder?: string;
  addNewPostButtonText?: string;
}) => {
  const { i18n } = useLingui();
  const chat = useChat();
  const game = useGame();
  const auth = useAuth();
  const userId = auth.uid || 'anonymous';
  return (
    <Stack
      sx={{
        borderBottom: chat.messages.length > 0 ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
        flexDirection: 'row',
        alignItems: 'center',
        padding: '20px 20px 20px 15px',
        gap: '15px',
      }}
      onClick={() => setIsNewPostModalOpen(true)}
    >
      <Avatar url={game.getUserAvatarUrl(userId)} avatarSize="35px" />
      <Stack
        sx={{
          width: '100%',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px',
        }}
      >
        <Stack>
          <Typography
            sx={{
              fontWeight: 600,
            }}
          >
            {game.myUserName}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              opacity: 0.6,
            }}
          >
            {placeholder || i18n._("What's new?")}
          </Typography>
        </Stack>

        <Button
          variant="contained"
          color="info"
          sx={{
            width: 'auto',
          }}
          startIcon={<AddIcon />}
          onClick={() => setIsNewPostModalOpen(true)}
        >
          {addNewPostButtonText || i18n._('Add Post')}
        </Button>
      </Stack>
    </Stack>
  );
};
