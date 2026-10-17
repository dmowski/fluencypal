'use client';

import { ButtonBase, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { RoomListItem } from '../types';
import { VoiceUserAvatar } from './VoiceUserAvatar';

export const RoomCard = ({ item, onOpen }: { item: RoomListItem; onOpen: () => void }) => {
  const { i18n } = useLingui();
  const note =
    item.membershipStatus === 'approved' || item.membershipStatus === 'pending'
      ? ''
      : item.room.reviewMode === 'alexOnly'
        ? i18n._('Alex reviews new people')
        : i18n._('Everyone in the room reviews new people');

  return (
    <ButtonBase
      data-testid={`voice-room-card-${item.room.id}`}
      onClick={onOpen}
      sx={{
        width: '100%',
        minHeight: 180,
        borderRadius: '18px',
        overflow: 'hidden',
        position: 'relative',
        textAlign: 'left',
        color: '#fff',
        alignItems: 'stretch',
        justifyContent: 'flex-start',
        backgroundColor: '#243044',
        backgroundImage: item.room.previewImageUrl
          ? `linear-gradient(180deg, rgba(10,14,22,0.15), rgba(10,14,22,0.82)), url(${item.room.previewImageUrl})`
          : 'linear-gradient(160deg, #31425c, #1b2433)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <Stack sx={{ width: '100%', padding: '16px', gap: '8px', justifyContent: 'flex-end' }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', gap: '8px' }}>
          <Typography sx={{ fontSize: '22px', fontWeight: 750, lineHeight: 1.2 }}>
            {item.room.title}
          </Typography>
          {item.unreadCount > 0 ? (
            <Typography
              data-testid="voice-room-unread"
              sx={{
                backgroundColor: '#e85d4c',
                borderRadius: '999px',
                padding: '2px 8px',
                fontSize: '13px',
                fontWeight: 700,
              }}
            >
              {item.unreadCount}
            </Typography>
          ) : null}
        </Stack>
        <Typography sx={{ opacity: 0.92 }}>{item.room.subtitle}</Typography>
        <Stack direction="row" sx={{ gap: '6px', alignItems: 'center' }}>
          {item.memberPreviews.map((member, index) => (
            <Stack
              key={member.userId}
              sx={{
                position: 'relative',
                marginLeft: index > 0 ? '-20px' : 0,
                boxShadow: '0 0 0 1px #fff, 0 0 0 3px rgba(0, 0, 0, 0.2)',
                zIndex: index,
                borderRadius: '50%',
                overflow: 'hidden',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <VoiceUserAvatar userId={member.userId} size="28px" />
            </Stack>
          ))}
          <Typography sx={{ fontSize: '13px', opacity: 0.86, paddingLeft: '5px' }}>
            {item.room.memberCount === 1
              ? i18n._('1 person')
              : i18n._('{count} people', { count: item.room.memberCount })}
            {' · '}
            {i18n._('{count} messages this week', { count: item.room.messagesLast7Days })}
          </Typography>
        </Stack>
        {note ? <Typography sx={{ fontSize: '13px', fontWeight: 650 }}>{note}</Typography> : null}
      </Stack>
    </ButtonBase>
  );
};
