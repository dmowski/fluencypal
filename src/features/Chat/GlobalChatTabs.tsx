import { Stack, Tabs, Tab } from '@mui/material';
import { TabLabel } from '../Game/TabLabel';
import { ChartSortMode } from './type';
import { useLingui } from '@lingui/react';
import { useChat } from './useChat';

export const GlobalChatTabs = ({
  sortMode,
  setSortMode,
}: {
  sortMode: ChartSortMode;
  setSortMode: (mode: ChartSortMode) => void;
}) => {
  const { i18n } = useLingui();
  const chat = useChat();
  const messages = chat.messages || [];

  return (
    <Stack>
      <Stack
        sx={{
          gap: '0px',
          width: '100%',
        }}
      >
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
            label={<TabLabel label={i18n._(`Replies`)} badgeNumber={undefined} badgeHighlight />}
            value={'updates'}
            sx={{
              padding: '0 10px 0 10px',
              minWidth: 'unset',
            }}
          />
        </Tabs>
      </Stack>
    </Stack>
  );
};
