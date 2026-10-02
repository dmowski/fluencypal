'use client';

import { ReactNode, useState } from 'react';
import { Stack, Tab, Tabs } from '@mui/material';
import { useLingui } from '@lingui/react';
import { TabLabel } from '@/features/Game/TabLabel';

type CallChatTab = 'chat' | 'participants';

export const FluencyCallChatTabs = ({
  chat,
  participants,
}: {
  chat: ReactNode;
  participants: ReactNode;
}) => {
  const { i18n } = useLingui();
  const [tab, setTab] = useState<CallChatTab>('chat');

  return (
    <Stack sx={{ gap: '16px' }}>
      <Tabs
        value={tab}
        onChange={(_, next: CallChatTab) => setTab(next)}
        data-testid="fluency-call-chat-tabs"
      >
        <Tab
          value="chat"
          data-testid="fluency-call-tab-chat"
          sx={{ padding: '0 10px', minWidth: 'unset' }}
          label={<TabLabel label={i18n._('Chat')} />}
        />
        <Tab
          value="participants"
          data-testid="fluency-call-tab-participants"
          sx={{ padding: '0 10px', minWidth: 'unset' }}
          label={<TabLabel label={i18n._('Participants')} />}
        />
      </Tabs>

      {tab === 'chat' ? chat : participants}
    </Stack>
  );
};
