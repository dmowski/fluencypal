'use client';

import { useLingui } from '@lingui/react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { useGame } from '@/features/Game/useGame';
import { isVoiceChatUserOnline } from '../isVoiceChatUserOnline';
import { voiceChatUi } from '../voiceChatUi';
import { VoiceChatUserRow } from './VoiceChatUserRow';

type MembersTab = 'total' | 'online';

export interface VoiceChatMembersDialogProps {
  open: boolean;
  onClose: () => void;
  memberUserIds: string[];
  initialTab?: MembersTab;
}

export const VoiceChatMembersDialog = ({
  open,
  onClose,
  memberUserIds,
  initialTab = 'total',
}: VoiceChatMembersDialogProps) => {
  const { i18n } = useLingui();
  const game = useGame();
  const [tab, setTab] = useState<MembersTab>(initialTab);

  const onlineUserIds = memberUserIds.filter((userId) =>
    isVoiceChatUserOnline(game.gameLastVisit?.[userId]),
  );

  const sortedTotalIds = [...memberUserIds].sort((a, b) => {
    const aOnline = isVoiceChatUserOnline(game.gameLastVisit?.[a]) ? 0 : 1;
    const bOnline = isVoiceChatUserOnline(game.gameLastVisit?.[b]) ? 0 : 1;
    return aOnline - bOnline;
  });

  const visibleIds = tab === 'online' ? onlineUserIds : sortedTotalIds;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="xs"
      data-testid="voice-chat-members-dialog"
    >
      <DialogTitle sx={{ fontWeight: 600, pb: 0 }}>{i18n._('People in voice chat')}</DialogTitle>
      <DialogContent sx={{ px: 0, pb: 2 }}>
        <Tabs
          value={tab}
          onChange={(_, value: MembersTab) => setTab(value)}
          variant="fullWidth"
          sx={{ borderBottom: `1px solid ${voiceChatUi.borderSubtle}`, px: 1 }}
        >
          <Tab
            label={i18n._('Total ({count})', { count: memberUserIds.length })}
            value="total"
          />
          <Tab
            label={i18n._('Online ({count})', { count: onlineUserIds.length })}
            value="online"
          />
        </Tabs>

        <Stack gap={1} sx={{ px: 2, pt: 1.5 }}>
          {visibleIds.length === 0 ? (
            <Typography variant="body2" sx={{ color: voiceChatUi.textMuted, py: 2 }}>
              {tab === 'online' ? i18n._('Nobody is online right now.') : i18n._('No members yet.')}
            </Typography>
          ) : (
            visibleIds.map((userId) => (
              <Stack
                key={userId}
                sx={{
                  px: 1.25,
                  py: 1,
                  borderRadius: '12px',
                  bgcolor: voiceChatUi.surfaceSubtle,
                }}
              >
                <VoiceChatUserRow userId={userId} avatarSize="35px" showOnlineLabel />
              </Stack>
            ))
          )}
        </Stack>
      </DialogContent>
    </Dialog>
  );
};
