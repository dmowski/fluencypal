import { Email } from '@mui/icons-material';
import { IconButton, Stack, Tabs, Tab, Typography, Badge } from '@mui/material';
import { useUrlState } from '../Url/useUrlState';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { useLingui } from '@lingui/react';
import { ChatPage } from '../Chat/ChatPage';
import { BattleSection } from '../Game/Battle/BattleSection';
import { useChatList } from '../Chat/useChatList';
import { useRouter } from 'next/navigation';
import NotificationsIcon from '@mui/icons-material/Notifications';

export const AppNotificationsButton: React.FC = () => {
  const [isShow, setIsShow] = useUrlState('inbox', false, false);
  const { i18n } = useLingui();
  const chatList = useChatList();
  const newMessagesCount = chatList.myUnreadCount;
  const router = useRouter();
  const [mode, setMode] = useUrlState<'messages' | 'debates' | ''>('inboxType', 'messages', false);

  const onClose = async () => {
    const searchParams = new URLSearchParams();
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    router.push(newUrl);
  };

  return (
    <>
      {isShow && (
        <CustomModal isOpen={isShow} onClose={onClose} mobilePadding="40px 0">
          <Stack
            sx={{
              maxWidth: '700px',

              gap: '30px',
              width: '100%',
            }}
          >
            <Stack
              sx={{
                padding: '0 10px',
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                }}
              >
                {i18n._('Inbox')}
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                }}
              >
                {i18n._('Here you can see your private messages with other users.')}
              </Typography>
            </Stack>
            <Stack
              sx={{
                alignItems: 'flex-start',
              }}
            >
              <Tabs
                value={mode}
                onChange={(e, value) => setMode(value)}
                variant="fullWidth"
                sx={{
                  paddingLeft: '15px',
                }}
              >
                <Tab
                  label={<Typography variant="button">{i18n._('Messages')}</Typography>}
                  value={'messages'}
                />
                <Tab
                  label={<Typography variant="button">{i18n._('Debates')}</Typography>}
                  value={'debates'}
                />
              </Tabs>
              <Stack
                sx={{
                  width: '100%',
                }}
              >
                {mode === 'messages' ? <ChatPage type={'private'} /> : <BattleSection />}
              </Stack>
            </Stack>
          </Stack>
        </CustomModal>
      )}

      <IconButton onClick={() => setIsShow(true)}>
        <Badge badgeContent={newMessagesCount} color="error">
          <NotificationsIcon
            sx={{
              opacity: 0.7,
            }}
          />
        </Badge>
      </IconButton>
    </>
  );
};
