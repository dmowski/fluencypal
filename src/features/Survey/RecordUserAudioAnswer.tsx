'use client';
import { Alert, Button, IconButton, Stack, Typography } from '@mui/material';

import { useLingui } from '@lingui/react';
import { Check, Goal, Mic, Trash } from 'lucide-react';
import { ReactNode } from 'react';
import { Trans } from '@lingui/react/macro';
import { getWordsCount } from '@/libs/words';

export const RecordUserAudioAnswer = ({
  transcript,
  minWords,
  maxWords,
  isLoading,
  isTranscribing,
  visualizerComponent,
  isRecording,
  stopRecording,
  startRecording,
  clearTranscript,
  error,
}: {
  transcript: string;
  minWords: number;
  maxWords?: number;
  isLoading?: boolean;
  isTranscribing: boolean;
  visualizerComponent: ReactNode;
  isRecording: boolean;
  stopRecording: () => Promise<void>;
  startRecording: () => Promise<void>;
  clearTranscript: () => void;
  error: string | null;
}) => {
  const { i18n } = useLingui();
  const wordsCount = getWordsCount(transcript || '');
  const isNeedMoreRecording = !transcript || wordsCount < minWords;
  const isNeedLessRecording = maxWords !== undefined && wordsCount > maxWords;
  const isInLimits = !isNeedMoreRecording && !isNeedLessRecording;

  return (
    <Stack
      sx={{
        width: '100%',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '12px 12px 15px 10px',
        borderRadius: '8px',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        opacity: isLoading ? 0.4 : 1,
      }}
      className={isLoading ? 'loading-shimmer-shape' : ''}
    >
      <Stack
        sx={{
          flexDirection: 'row',
          width: '100%',
          justifyContent: 'space-between',
          paddingBottom: '14px',
          flexWrap: 'wrap',
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
          }}
        >
          {i18n._('Your answer')}
        </Typography>

        <Typography
          variant="caption"
          sx={{
            color: isNeedLessRecording
              ? '#ff4740ff'
              : wordsCount === 0
                ? 'inherit'
                : wordsCount < minWords
                  ? '#FFA500'
                  : '#4CAF50',
          }}
        >
          {wordsCount > 0 && (
            <>
              {wordsCount} /{' '}
              <b>
                {minWords} {maxWords ? `- ${maxWords} ` : ''}{' '}
              </b>
            </>
          )}
        </Typography>
      </Stack>

      <Typography
        variant={transcript ? 'body2' : 'caption'}
        sx={{
          opacity: transcript ? 1 : 0.8,
        }}
        className={isTranscribing ? `loading-shimmer` : ''}
      >
        {transcript && transcript}

        {isTranscribing && ' ' + i18n._('Processing...')}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ marginTop: '10px' }}>
          {i18n._('Error:')} {error}
        </Alert>
      )}

      {!transcript && !isTranscribing && (
        <Stack
          sx={{
            alignItems: 'center',
            gap: '10px',
            //color: "#888",
            paddingBottom: '10px',
          }}
        >
          <Goal size={'24px'} color="rgba(255, 255, 255, 0.3)" strokeWidth={'2px'} />
          <Typography variant="h6" align="center" sx={{}}>
            <Trans>
              Goal: at least <b>{minWords}</b> words
            </Trans>
          </Typography>
        </Stack>
      )}

      {!isTranscribing && (
        <Stack>
          <Stack
            sx={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: transcript ? 'space-between' : 'center',
              paddingTop: '12px',
              gap: '10px',
            }}
          >
            <Button
              variant={isNeedMoreRecording ? 'contained' : 'outlined'}
              startIcon={isRecording ? <Check size={'16px'} /> : <Mic size={'16px'} />}
              size="small"
              color={isRecording ? 'error' : 'primary'}
              sx={{
                paddingRight: '15px',
              }}
              disabled={isNeedLessRecording}
              onClick={() => {
                if (isRecording) {
                  stopRecording();
                } else {
                  startRecording();
                }
              }}
            >
              {isRecording
                ? i18n._('Done')
                : !transcript
                  ? i18n._('Record')
                  : i18n._('Record more')}
            </Button>
            {transcript && (
              <IconButton size="small" onClick={clearTranscript} disabled={isRecording}>
                <Trash size={'16px'} />
              </IconButton>
            )}
          </Stack>

          {visualizerComponent}
        </Stack>
      )}
    </Stack>
  );
};
