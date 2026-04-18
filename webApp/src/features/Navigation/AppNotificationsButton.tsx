import { IconButton, Stack, Tabs, Tab, Typography, Badge, Button } from '@mui/material';
import { useUrlState } from '../Url/useUrlState';
import { CustomModal } from '../uiKit/Modal/CustomModal';
import { useLingui } from '@lingui/react';
import { ChatPage } from '../Chat/ChatPage';
import { useChatList } from '../Chat/useChatList';
import { useRouter } from 'next/navigation';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useBattle } from '../Game/Battle/useBattle';
import { TabLabel } from '../Game/TabLabel';
import { DailyQuestionNotificationsList } from '../DailyQuestion/DailyQuestionNotificationsList';
import { useAccess } from '../Usage/useAccess';

type ModeType = 'messages' | 'dailyQuestions' | 'chat';

export const AppNotificationsButton: React.FC = () => {
  const [isShow, setIsShow] = useUrlState('inbox', false, false);
  const { i18n } = useLingui();
  const chatList = useChatList();
  const newMessagesCount = chatList.myUnreadCount;
  const router = useRouter();
  const battles = useBattle();
  const access = useAccess();

  const [mode, setMode] = useUrlState<ModeType>('inboxType', 'dailyQuestions', false);

  const onClose = async () => {
    const searchParams = new URLSearchParams();
    const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
    router.push(newUrl);
  };

  const notificationsCount =
    newMessagesCount +
    battles.countOfBattlesNeedToAttention +
    chatList.totalDailyQuestionsUnreadMessagesCount +
    chatList.unreadGlobalChatCount;

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
                {i18n._('Notifications')}
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
                  label={
                    <TabLabel
                      label={i18n._('Questions')}
                      badgeNumber={chatList.totalDailyQuestionsUnreadMessagesCount}
                      badgeHighlight
                    />
                  }
                  value={'dailyQuestions'}
                />

                <Tab
                  label={
                    <TabLabel
                      label={i18n._('Chat')}
                      badgeNumber={chatList.unreadGlobalChatCount}
                      badgeHighlight
                    />
                  }
                  value={'chat'}
                />

                <Tab
                  label={<TabLabel label={i18n._('Messages')} badgeNumber={newMessagesCount} />}
                  value={'messages'}
                />
              </Tabs>
              <Stack
                sx={{
                  width: '100%',
                }}
              >
                {mode === 'messages' && <ChatPage type={'private'} />}
                {mode === 'dailyQuestions' && <DailyQuestionNotificationsList />}
                {mode === 'chat' && (
                  <Stack
                    sx={{
                      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.01)',
                    }}
                  >
                    {access.isFullAppAccess ? (
                      <ChatPage type={'public'} />
                    ) : (
                      <Stack
                        sx={{
                          alignItems: 'flex-start',
                          padding: '20px',
                          gap: '20px',
                        }}
                      >
                        <Typography variant="h5" sx={{}}>
                          {i18n._('Full Access is required to see global chat')}
                        </Typography>
                        <Button variant="contained" color="info" onClick={access.showPaymentModal}>
                          {i18n._('Upgrade to Full Access')}
                        </Button>
                      </Stack>
                    )}
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Stack>
        </CustomModal>
      )}

      <IconButton onClick={() => setIsShow(true)}>
        <Badge badgeContent={notificationsCount} color="error">
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
