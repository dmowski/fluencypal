'use client';

import { Button, LinearProgress, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { SectionHeader } from '@/features/Dashboard/CartsHeader';
import { LessonHistoryView } from './LessonHistoryView';
import { UserAudioPlayer } from './UserAudioPlayer';
import { canShowAudioProgress, remainingAudiosForProgress } from './audioProgress';
import { PROGRESS_MIN_AUDIO_COUNT } from './constants';
import { InteractiveLesson, LessonAudioProgress, LessonAudioRecord } from './types';

const AudioColumn = ({
  title,
  records,
  testId,
}: {
  title: string;
  records: LessonAudioRecord[];
  testId: string;
}) => {
  return (
    <Stack sx={{ gap: '12px', minWidth: 0 }} data-testid={testId}>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {title}
      </Typography>
      {records.map((record) => (
        <Stack
          key={record.id}
          sx={{
            gap: '6px',
            padding: '10px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}
        >
          <UserAudioPlayer audioUrl={record.audioUrl} />
          {record.transcript && (
            <Typography variant="body2" sx={{ opacity: 0.85 }}>
              {record.transcript}
            </Typography>
          )}
        </Stack>
      ))}
    </Stack>
  );
};

export const LessonProgressView = ({
  audioProgress,
  lessons,
  onContinueLesson,
}: {
  audioProgress: LessonAudioProgress;
  lessons: InteractiveLesson[];
  onContinueLesson: () => void;
}) => {
  const { i18n } = useLingui();
  const recorded = audioProgress.totalCount;
  const remaining = remainingAudiosForProgress(recorded);
  const showComparison = canShowAudioProgress(recorded);
  const progressValue = Math.min(100, (recorded / PROGRESS_MIN_AUDIO_COUNT) * 100);

  return (
    <Stack sx={{ gap: '28px' }} data-testid="interactive-lesson-progress">
      {showComparison ? (
        <Stack
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            '@media (max-width:600px)': { gridTemplateColumns: '1fr' },
          }}
        >
          <AudioColumn
            title={i18n._('Before')}
            records={audioProgress.first}
            testId="interactive-lesson-progress-before"
          />
          <AudioColumn
            title={i18n._('After')}
            records={audioProgress.last}
            testId="interactive-lesson-progress-after"
          />
        </Stack>
      ) : (
        <Stack
          sx={{
            gap: '16px',
            padding: '18px',
            borderRadius: '14px',
            backgroundColor: 'rgba(63, 159, 243, 0.12)',
          }}
          data-testid="interactive-lesson-progress-needed"
        >
          <Stack sx={{ gap: '6px' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {i18n._('Hear how your English changes')}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.85 }}>
              {recorded === 0
                ? i18n._(
                    'Speak in today’s lesson. We save your first answers, then compare them with your newest ones.',
                  )
                : i18n._(
                    'Nice work — {done} spoken answers so far. {count} more unlocks a Before / After of your voice.',
                    { done: recorded, count: remaining },
                  )}
            </Typography>
          </Stack>
          <Stack sx={{ gap: '8px' }}>
            <Typography variant="caption" sx={{ opacity: 0.75 }}>
              {i18n._('{done} of {goal} answers', {
                done: recorded,
                goal: PROGRESS_MIN_AUDIO_COUNT,
              })}
            </Typography>
            <LinearProgress variant="determinate" value={progressValue} color="info" />
          </Stack>
          <Button
            variant="contained"
            color="info"
            onClick={onContinueLesson}
            data-testid="interactive-lesson-progress-continue"
            sx={{ alignSelf: 'flex-start', padding: '10px 22px' }}
          >
            {recorded === 0 ? i18n._('Start today’s lesson') : i18n._('Keep practicing')}
          </Button>
        </Stack>
      )}

      <Stack sx={{ gap: '16px', paddingTop: '20px' }}>
        <SectionHeader
          title={i18n._('History')}
          subTitle={i18n._('Finished lessons. Open one to hear your answers again.')}
        />
        <LessonHistoryView lessons={lessons} />
      </Stack>
    </Stack>
  );
};
