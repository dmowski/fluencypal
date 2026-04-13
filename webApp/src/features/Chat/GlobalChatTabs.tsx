import { Stack, Tabs, Tab } from '@mui/material';
import { TabLabel } from '../Game/TabLabel';
import { ChartSortMode } from './type';
import { useLingui } from '@lingui/react';
import { useUrlState } from '../Url/useUrlState';
import { useChatList } from './useChatList';

export const GlobalChatTabs = ({
  sortMode,
  setSortMode,
}: {
  sortMode: ChartSortMode;
  setSortMode: (mode: ChartSortMode) => void;
}) => {
  const { i18n } = useLingui();
  const [activeChatPost] = useUrlState<string | null>('post', null, true);
  const chatList = useChatList();
  const isShowTabs = !activeChatPost;

  return (
    <Stack>
      <Stack
        sx={{
          gap: '0px',
          width: '100%',
        }}
      >
        {isShowTabs && (
          <Tabs
            value={sortMode}
            onChange={(event, newId) => setSortMode(newId)}
            sx={{
              marginLeft: '10px',
            }}
          >
            <Tab
              sx={{
                padding: '0 10px 0 10px',
                minWidth: 'unset',
              }}
              label={
                <TabLabel
                  label={i18n._(`All`)}
                  badgeNumber={
                    chatList.unreadGlobalChatCount > 0 ? chatList.unreadGlobalChatCount : undefined
                  }
                  badgeHighlight
                />
              }
              value={'all'}
            />

            <Tab
              label={
                <TabLabel
                  label={i18n._(`Replies`)}
                  badgeNumber={
                    chatList.globalChatRepliesUnreadCount > 0
                      ? chatList.globalChatRepliesUnreadCount
                      : undefined
                  }
                  badgeHighlight
                />
              }
              value={'replies'}
              sx={{
                padding: '0 10px 0 10px',
                minWidth: 'unset',
              }}
            />
          </Tabs>
        )}
      </Stack>
    </Stack>
  );
};
