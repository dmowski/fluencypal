import { useState } from 'react';
import { UserChatMessage } from './type';
import { useLingui } from '@lingui/react';
import { useGame } from '../Game/useGame';
import { Stack, Typography, Popover } from '@mui/material';
import { Eye } from 'lucide-react';
import { GameStatRow } from '../Game/GameStatRow';

export const MessageViewsIcon = ({ activeMessage }: { activeMessage: UserChatMessage }) => {
  const [showViewsAnchorEl, setShowViewsAnchorEl] = useState<null | HTMLElement>(null);
  const { i18n } = useLingui();
  const game = useGame();

  return (
    <>
      <Stack
        sx={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: '10px',
          paddingRight: '8px',
          color: 'rgba(255, 255, 255, 0.5)',
        }}
        onClick={(e) => setShowViewsAnchorEl(e.currentTarget)}
      >
        <Typography variant="caption">{activeMessage.viewsUserIds?.length || 0}</Typography>
        <Eye
          size={'18px'}
          style={{
            opacity: 0.7,
            color: 'inherit',
          }}
        />
      </Stack>

      <Popover
        anchorEl={showViewsAnchorEl}
        open={!!showViewsAnchorEl}
        onClose={() => setShowViewsAnchorEl(null)}
        slotProps={{
          backdrop: {
            sx: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            },
          },
        }}
      >
        <Stack
          sx={{
            padding: '10px 10px',
            maxWidth: '600px',
            maxHeight: '400px',
            overflowY: 'auto',
            gap: '10px',
          }}
        >
          <Typography variant="body2">{i18n._('Users who viewed this post')}</Typography>
          {activeMessage.viewsUserIds && activeMessage.viewsUserIds.length > 0 ? (
            activeMessage.viewsUserIds.map((uid) => {
              const userStat = game.stats.find((stat) => stat.userId === uid);
              return <Stack key={uid}>{userStat && <GameStatRow stat={userStat} />}</Stack>;
            })
          ) : (
            <Typography variant="caption" sx={{ opacity: 0.7 }}>
              {i18n._('No views yet. Be the first to view this post!')}
            </Typography>
          )}
        </Stack>
      </Popover>
    </>
  );
};
