import { uniq } from '@/libs/uniq';
import { useLingui } from '@lingui/react';
import {
  Stack,
  Typography,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Menu,
} from '@mui/material';
import dayjs from 'dayjs';
import { CircleEllipsis, FlagIcon, DeleteIcon } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../Auth/useAuth';
import { useGame } from '../Game/useGame';
import { UserName } from '../User/UserName';
import { useUserReport } from '../User/useUserReport';
import { UserChatMetadata } from './type';
import { useChatList } from './useChatList';
import { Avatar } from '../Game/Avatar';

export const ChatHeaderFull = ({ chat, close }: { chat: UserChatMetadata; close: () => void }) => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const game = useGame();
  const userReport = useUserReport();

  const chatList = useChatList();

  const allUserIds = uniq(
    chat.allowedUserIds?.sort((a, b) => {
      // me first
      if (a === auth.uid) return -1;
      if (b === auth.uid) return 1;
      return 0;
    }) || [],
  );

  const isOnlyOneUser = allUserIds.length <= 1;
  const userIds = allUserIds.filter((userId) => isOnlyOneUser || userId !== auth.uid);
  const firstNonMyUserId = allUserIds.find((userId) => userId !== auth.uid) || '';
  const lastVisited = dayjs(
    userIds
      .map((userId) => game.gameLastVisit?.[userId])
      .sort()
      .reverse()[0] || Date.now(),
  ).fromNow();

  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const deleteChat = async () => {
    const isConfirmed = window.confirm(
      i18n._('Are you sure you want to delete this chat? This action cannot be undone.'),
    );
    if (isConfirmed) {
      await chatList.deleteChat(chat.spaceId);
      close();
      setTimeout(() => alert(i18n._('Chat deleted successfully.')), 100);
    }
  };

  return (
    <>
      <Stack
        sx={{
          flexDirection: 'row',
          minWidth: '44px',
        }}
      >
        {userIds.map((userId, index) => {
          return (
            <Stack
              key={userId}
              sx={{
                marginLeft: index === 0 ? '0' : '-30px',
              }}
            >
              <Avatar
                url={game.getUserAvatarUrl(userId)}
                avatarSize={'90px'}
                onClick={() => {
                  game.showUserInModal(userId);
                }}
              />
            </Stack>
          );
        })}
      </Stack>
      <Stack
        sx={{
          alignItems: 'center',
        }}
      >
        <Typography variant="caption">
          {chat.type === 'debate' && i18n._('Debate Chat')}
          {chat.type === 'dailyQuestion' && i18n._('Daily Question Chat')}
          {chat.type === 'global' && i18n._('Global Chat')}
          {chat.type === 'privateChat' && i18n._('Chat')}

          {!chat.type && i18n._('Chat')}
        </Typography>

        <Stack>
          {userIds.map((userId) => {
            const userName = game.getUserName(userId);
            return (
              <UserName size="large" key={userId} userId={userId} userName={userName} center />
            );
          })}
        </Stack>

        <Stack
          sx={{
            paddingTop: '4px',
            position: 'absolute',
            top: '10px',
            right: '15px',
            flexDirection: 'row',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              opacity: 0.7,
            }}
          >
            {i18n._('Last visited: {lastVisited}', { lastVisited })}
          </Typography>
          <IconButton size="small" onClick={(e) => setMenuAnchorEl(e.currentTarget)}>
            <CircleEllipsis size={'18px'} />
          </IconButton>

          <Menu
            anchorEl={menuAnchorEl}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            keepMounted
            open={Boolean(menuAnchorEl)}
            onClose={() => setMenuAnchorEl(null)}
          >
            <MenuItem
              disabled={!firstNonMyUserId}
              onClick={() => {
                if (firstNonMyUserId) {
                  userReport.openReportModal(firstNonMyUserId);
                }
                setMenuAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <FlagIcon color="warning" />
              </ListItemIcon>
              <ListItemText>{i18n._('Report user')}</ListItemText>
            </MenuItem>

            <MenuItem
              onClick={() => {
                deleteChat();
                setMenuAnchorEl(null);
              }}
            >
              <ListItemIcon>
                <DeleteIcon color="error" />
              </ListItemIcon>
              <ListItemText>
                <Typography color="error">{i18n._('Delete chat')}</Typography>
              </ListItemText>
            </MenuItem>
          </Menu>
        </Stack>
      </Stack>
    </>
  );
};
