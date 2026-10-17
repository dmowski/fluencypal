'use client';

import { Button, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { Mic } from 'lucide-react';
import { Markdown } from '@/features/uiKit/Markdown/Markdown';
import { SpeakingRoom } from '../types';

export const countWords = (text: string): number =>
  text.trim().length === 0 ? 0 : text.trim().split(/\s+/).filter(Boolean).length;

export const INTRO_SHORT_WORD_COUNT = 80;

export const JoinRoomView = ({
  room,
  isRecording,
  isTranscribing,
  transcript,
  suggestion,
  corrected,
  onRecord,
  onSend,
  onRecordAgain,
  isSending,
  isPending,
}: {
  room: SpeakingRoom;
  isRecording: boolean;
  isTranscribing: boolean;
  transcript: string;
  suggestion: string;
  corrected: string;
  onRecord: () => void;
  onSend: () => void;
  onRecordAgain: () => void;
  isSending: boolean;
  isPending: boolean;
}) => {
  const { i18n } = useLingui();
  const isShort = transcript.trim().length > 0 && countWords(transcript) < INTRO_SHORT_WORD_COUNT;
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
          backgroundImage: room.previewImageUrl
            ? `linear-gradient(180deg, rgba(10,14,22,0.1), rgba(10,14,22,0.55)), url(${room.previewImageUrl})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <Typography variant="h4" sx={{ fontWeight: 800 }}>
        {room.title}
      </Typography>
      <Typography sx={{ opacity: 0.8 }}>{room.subtitle}</Typography>
      <Typography>
        {room.memberCount === 1
          ? i18n._('1 person')
          : i18n._('{count} people', { count: room.memberCount })}
        {' · '}
        {i18n._('{count} messages this week', { count: room.messagesLast7Days })}
      </Typography>
      <Typography sx={{ fontWeight: 700 }}>{review}</Typography>
      <Stack sx={{ gap: '6px' }}>
        <Typography sx={{ fontWeight: 800 }}>{i18n._('What we usually talk about')}</Typography>
        <Markdown>{room.discussMarkdown}</Markdown>
      </Stack>
      <Stack sx={{ gap: '6px' }}>
        <Typography sx={{ fontWeight: 800 }}>{i18n._('Room rules')}</Typography>
        <Markdown>{room.rulesMarkdown}</Markdown>
      </Stack>
      <Stack sx={{ gap: '6px' }}>
        <Typography sx={{ fontWeight: 800 }}>{i18n._('Your introduction')}</Typography>
        <Markdown>{room.joinPromptMarkdown}</Markdown>
      </Stack>
      {!transcript ? (
        <Button
          data-testid="voice-room-record-intro"
          variant="contained"
          color={isRecording ? 'error' : 'info'}
          startIcon={<Mic size={18} />}
          onClick={onRecord}
          disabled={isTranscribing}
          sx={{ alignSelf: 'flex-start', borderRadius: '12px', textTransform: 'none' }}
        >
          {isRecording
            ? i18n._('Stop')
            : isTranscribing
              ? i18n._('Writing down what you said...')
              : i18n._('Record introduction')}
        </Button>
      ) : (
        <Stack data-testid="voice-room-intro-review" sx={{ gap: '10px' }}>
          <Typography sx={{ fontWeight: 700 }}>{i18n._('What we heard')}</Typography>
          <Typography>{transcript}</Typography>
          {corrected && corrected.trim() !== transcript.trim() ? (
            <>
              <Typography sx={{ fontWeight: 700 }}>{i18n._('A clearer version')}</Typography>
              <Typography>{corrected}</Typography>
            </>
          ) : null}
          {suggestion ? <Typography sx={{ opacity: 0.85 }}>{suggestion}</Typography> : null}
          {isShort ? (
            <Typography data-testid="voice-room-intro-short" color="warning">
              {i18n._(
                'A longer introduction helps people get to know you. About three minutes is a good length.',
              )}
            </Typography>
          ) : null}
          <Stack direction="row" sx={{ gap: '10px', flexWrap: 'wrap' }}>
            <Button
              data-testid="voice-room-send-intro"
              variant="contained"
              color="info"
              disabled={isSending}
              onClick={onSend}
              sx={{ borderRadius: '12px', textTransform: 'none' }}
            >
              {isSending ? i18n._('Sending...') : i18n._('Send for review')}
            </Button>
            <Button
              variant="outlined"
              onClick={onRecordAgain}
              sx={{ borderRadius: '12px', textTransform: 'none' }}
            >
              {i18n._('Record again')}
            </Button>
          </Stack>
        </Stack>
      )}
    </Stack>
  );
};
