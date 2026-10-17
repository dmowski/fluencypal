'use client';

import { useState } from 'react';
import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { RoomMember } from '../types';
import { VoiceUserAvatar } from './VoiceUserAvatar';

export const MembersPanel = ({
  members,
  canReview,
  currentUserId,
  onDecide,
  onPlayIntro,
}: {
  members: RoomMember[];
  canReview: boolean;
  currentUserId: string;
  onDecide: (userId: string, decision: 'approved' | 'rejected') => Promise<void> | void;
  onPlayIntro: (userId: string) => Promise<string>;
}) => {
  const { i18n } = useLingui();
  const [nowMs] = useState(() => Date.now());
  const [audioByUser, setAudioByUser] = useState<Record<string, string>>({});
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const approved = members.filter((member) => member.status === 'approved');
  const pending = members.filter((member) => member.status === 'pending');

  const lastSeen = (iso: string | undefined): string => {
    if (!iso) return i18n._('Has not visited yet');
    const diff = nowMs - Date.parse(iso);
    if (!Number.isFinite(diff) || diff < 3 * 60 * 1000) return i18n._('Here now');
    const hours = Math.floor(diff / (60 * 60 * 1000));
    if (hours < 1) return i18n._('Last seen recently');
    if (hours < 24) return i18n._('Last seen today');
    return i18n._('Last seen earlier');
  };

  return (
    <Stack data-testid="voice-room-members" sx={{ gap: '16px', width: '100%' }}>
      {pending.length > 0 ? (
        <Stack sx={{ gap: '10px' }}>
          <Typography sx={{ fontWeight: 800 }}>{i18n._('Waiting for a review')}</Typography>
          {pending.map((member) => (
            <Stack
              key={member.userId}
              data-testid={`voice-room-pending-${member.userId}`}
              sx={{
                gap: '8px',
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255,255,255,0.04)',
              }}
            >
              <Stack direction="row" sx={{ gap: '10px', alignItems: 'center' }}>
                <VoiceUserAvatar userId={member.userId} size="42px" />
                <Typography sx={{ fontWeight: 700 }}>{member.username}</Typography>
              </Stack>
              <Typography>{member.introTranscript}</Typography>
              {audioByUser[member.userId] ? (
                <audio controls src={audioByUser[member.userId]} />
              ) : (
                <Button
                  variant="text"
                  onClick={() => {
                    void onPlayIntro(member.userId).then((url) => {
                      setAudioByUser((current) => ({ ...current, [member.userId]: url }));
                    });
                  }}
                  sx={{ alignSelf: 'flex-start', textTransform: 'none' }}
                >
                  {i18n._('Play introduction')}
                </Button>
              )}
              {canReview && member.approvals[currentUserId] === 'approved' ? (
                <Typography data-testid={`voice-room-welcomed-${member.userId}`}>
                  {i18n._('You welcomed them. Waiting for the other people in the room.')}
                </Typography>
              ) : null}
              {canReview && member.approvals[currentUserId] !== 'approved' ? (
                <Stack direction="row" sx={{ gap: '8px', flexWrap: 'wrap' }}>
                  <Button
                    data-testid={`voice-room-approve-${member.userId}`}
                    variant="contained"
                    color="info"
                    disabled={busyUserId === member.userId}
                    onClick={() => {
                      setBusyUserId(member.userId);
                      void Promise.resolve(onDecide(member.userId, 'approved')).finally(() =>
                        setBusyUserId(null),
                      );
                    }}
                    sx={{ textTransform: 'none' }}
                  >
                    {i18n._('Welcome them')}
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={busyUserId === member.userId}
                    onClick={() => {
                      setBusyUserId(member.userId);
                      void Promise.resolve(onDecide(member.userId, 'rejected')).finally(() =>
                        setBusyUserId(null),
                      );
                    }}
                    sx={{ textTransform: 'none' }}
                  >
                    {i18n._('Not this time')}
                  </Button>
                </Stack>
              ) : null}
            </Stack>
          ))}
        </Stack>
      ) : null}
      <Typography sx={{ fontWeight: 800 }}>{i18n._('People in this room')}</Typography>
      {approved.map((member) => (
        <Stack key={member.userId} direction="row" sx={{ gap: '10px', alignItems: 'flex-start' }}>
          <VoiceUserAvatar
            userId={member.userId}
            size="42px"
            isOnline={Boolean(
              member.lastOnlineIso && nowMs - Date.parse(member.lastOnlineIso) < 3 * 60 * 1000,
            )}
          />
          <Stack sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700 }}>{member.username}</Typography>
            {member.description ? (
              <Typography sx={{ opacity: 0.8 }}>{member.description}</Typography>
            ) : null}
            <Typography sx={{ fontSize: '13px', opacity: 0.7 }}>
              {lastSeen(member.lastOnlineIso)}
            </Typography>
          </Stack>
        </Stack>
      ))}
    </Stack>
  );
};
