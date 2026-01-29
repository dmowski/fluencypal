import { Stack, Tabs, Tab } from '@mui/material';
import { TabLabel } from '../Game/TabLabel';
import { ChartSortMode } from './type';
import { useLingui } from '@lingui/react';
import { useChat } from './useChat';
import { useAuth } from '../Auth/useAuth';
import { db } from '../Firebase/firebaseDb';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { getAllChildrenMessages } from './getAllChildrenMessages';
import { uniq } from '@/libs/uniq';
import { useMemo } from 'react';
import { useUrlState } from '../Url/useUrlState';

export const GlobalChatTabs = ({
  sortMode,
  setSortMode,
}: {
  sortMode: ChartSortMode;
  setSortMode: (mode: ChartSortMode) => void;
}) => {
  const { i18n } = useLingui();
  const chat = useChat();
  const auth = useAuth();
  const myReadStatsRef = db.documents.chatSpaceUserReadMetadata(auth.uid || '');
  const [myReadStatsData] = useDocumentData(myReadStatsRef);
  const [activeChatPost] = useUrlState<string | null>('post', null, true);

  const unreadRepliesCount = useMemo(() => {
    const messages = chat.messages || [];
    const myMessages = messages.filter((msg) => msg.senderId === auth.uid);

    const childrenOfMyMessages = messages
      .map((msg) => getAllChildrenMessages(msg, messages))
      .flat();

    const allMyMessagesIds = uniq([
      ...myMessages.map((msg) => msg.id),
      ...childrenOfMyMessages.map((msg) => msg.id),
    ]);

    const myGlobalStatsReadMessagesIds = Object.keys(myReadStatsData?.['global'] || {});
    const unreadReplies = allMyMessagesIds.filter(
      (id) => !myGlobalStatsReadMessagesIds.includes(id),
    );

    //return unreadReplies.length;
    return 0;
  }, [chat.messages, auth.uid, myReadStatsData]);

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
              label={<TabLabel label={i18n._(`All`)} badgeNumber={undefined} badgeHighlight />}
              value={'all'}
            />

            <Tab
              label={
                <TabLabel
                  label={i18n._(`Replies`)}
                  badgeNumber={unreadRepliesCount > 0 ? unreadRepliesCount : undefined}
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
