'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Avatar } from '@/features/User/Avatar';
import { UserName } from '@/features/User/UserName';

export type CallParticipant = {
  userId: string;
  userName: string;
  avatarUrl: string;
};

export const FluencyCallParticipants = ({
  participants,
  loading,
  onOpenParticipant,
}: {
  participants: CallParticipant[];
  loading: boolean;
  onOpenParticipant: (userId: string) => void;
}) => {
  const { i18n } = useLingui();
  const ordered = [...participants].sort((a, b) => a.userName.localeCompare(b.userName));

  if (loading) {
    return <Typography>{i18n._('Loading...')}</Typography>;
  }

  if (ordered.length === 0) {
    return (
      <Typography data-testid="fluency-call-participants-empty" sx={{ color: 'text.secondary' }}>
        {i18n._('No one will join yet.')}
      </Typography>
    );
  }

  return (
    <Stack sx={{ gap: '8px' }} data-testid="fluency-call-participants">
      {ordered.map((participant) => (
        <Stack
          key={participant.userId}
          component="button"
          type="button"
          data-testid="fluency-call-participant"
          onClick={() => onOpenParticipant(participant.userId)}
          sx={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: '12px',
            width: '100%',
            padding: '8px 12px',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            color: '#fff',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <Avatar avatarSize="40px" url={participant.avatarUrl} />
          <UserName userId={participant.userId} userName={participant.userName} bold />
        </Stack>
      ))}
    </Stack>
  );
};
