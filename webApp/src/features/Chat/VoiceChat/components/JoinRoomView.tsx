'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { SubmitForm, SubmitRecording } from '@/features/Chat/SubmitForm';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { coverImageCss } from '../backend/guards';
import { SpeakingRoom } from '../types';
import { VoiceNotice } from './VoiceNotice';

export const JoinRoomView = ({
  room,
  isSending,
  isPending,
  onSubmitRecording,
}: {
  room: SpeakingRoom;
  isSending: boolean;
  isPending: boolean;
  onSubmitRecording: (recording: SubmitRecording) => Promise<void>;
}) => {
  const { i18n } = useLingui();
  const review =
    room.reviewMode === 'alexOnly'
      ? i18n._('Alex reviews new people')
      : i18n._('Everyone in the room reviews new people');

  if (isPending) {
    return (
      <Stack data-testid="voice-room-pending" sx={{ width: '100%', maxWidth: 720, gap: '12px' }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {room.title}
        </Typography>
        <Typography>
          {i18n._(
            'We are reviewing your introduction. You will get a note when there is an answer.',
          )}
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack data-testid="voice-room-join" sx={{ width: '100%', maxWidth: 720, gap: '14px' }}>
      <Stack
        sx={{
          height: 180,
          borderRadius: '16px',
          backgroundColor: '#243044',
          backgroundImage: coverImageCss(room.previewImageUrl)
            ? `linear-gradient(180deg, rgba(10,14,22,0.1), rgba(10,14,22,0.55)), ${coverImageCss(room.previewImageUrl)}`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Stack sx={{ gap: '52px' }}>
        <Stack sx={{ gap: '12px' }}>
          <Stack>
            <Typography variant="h4">{room.title}</Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>
              {room.subtitle}
            </Typography>
          </Stack>
          <Stack>
            <Typography
              sx={{
                opacity: 0.7,
              }}
            >
              {room.memberCount === 1
                ? i18n._('1 person')
                : i18n._('{count} people', { count: room.memberCount })}
              {' · '}
              {i18n._('{count} messages this week', { count: room.messagesLast7Days })}
            </Typography>
            <Typography sx={{ opacity: 0.7 }}>{review}</Typography>
          </Stack>
        </Stack>

        <Stack sx={{ gap: '10px' }}>
          <Typography variant="h5">{i18n._('What we usually talk about')}</Typography>
          <Markdown safe>{room.discussMarkdown}</Markdown>
        </Stack>
        <Stack sx={{ gap: '10px' }}>
          <Typography variant="h5">{i18n._('Room rules')}</Typography>
          <Markdown safe>{room.rulesMarkdown}</Markdown>
        </Stack>
        <Stack sx={{ gap: '10px' }}>
          <Typography variant="h5">{i18n._('Your introduction')}</Typography>
          <Markdown safe>{room.joinPromptMarkdown}</Markdown>
        </Stack>
      </Stack>
      <Stack
        sx={{
          marginTop: '16px',
          border: '1px solid #333',
          backgroundColor: 'rgba(36, 48, 68, 0.1)',
          borderRadius: '16px',
          padding: '0px',
        }}
      >
        <VoiceNotice kind="intro" />
        <SubmitForm
          onSubmit={async () => {}}
          onSubmitRecording={onSubmitRecording}
          isLoading={isSending}
          recordMessageTitle={i18n._('Record introduction')}
          setIsActiveRecording={() => {}}
          previousBotMessage={room.joinPromptMarkdown}
        />
      </Stack>
    </Stack>
  );
};
