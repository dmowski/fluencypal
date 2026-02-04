import { useState } from 'react';
import { ThreadsMessage } from './type';
import { useLingui } from '@lingui/react';
import { useGame } from '../Game/useGame';
import { Stack, Typography, Popover } from '@mui/material';
import { Eye } from 'lucide-react';
import { GameStatRow } from '../Game/GameStatRow';
import { uniq } from '@/libs/uniq';

export const MessageViewsIcon = ({ activeMessage }: { activeMessage: ThreadsMessage }) => {
  const [showViewsAnchorEl, setShowViewsAnchorEl] = useState<null | HTMLElement>(null);
  const { i18n } = useLingui();
  const game = useGame();

  const viewUserIdsMap = activeMessage.viewsUserIdsMap
    ? Object.keys(activeMessage.viewsUserIdsMap)
    : [];

  const viewUserIds = uniq([...viewUserIdsMap, ...(activeMessage.viewsUserIds || [])]);

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
        <Typography variant="caption">{viewUserIds.length || 0}</Typography>
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
          {viewUserIds && viewUserIds.length > 0 ? (
            viewUserIds.map((uid) => {
              const userStat = game.stats.find((stat) => stat.userId === uid);
              return (
                <Stack key={uid}>{userStat && <GameStatRow stat={userStat} hidePosition />}</Stack>
              );
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
