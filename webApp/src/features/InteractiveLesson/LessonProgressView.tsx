'use client';

import { Button, LinearProgress, Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { SectionHeader } from '@/features/Dashboard/CartsHeader';
import { LessonHistoryView } from './LessonHistoryView';
import { UserAudioPlayer } from './UserAudioPlayer';
import { canShowAudioProgress, remainingAudiosForProgress } from './audioProgress';
import { PROGRESS_MIN_AUDIO_COUNT } from './constants';
import { InteractiveLesson, LessonAudioProgress, LessonAudioRecord } from './types';
import { LESSON_THEME_VARS, lessonAccentButtonSx } from './lessonTheme';

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
            backgroundColor: 'color-mix(in srgb, var(--text-primary-dark) 5%, transparent)',
          }}
        >
          <UserAudioPlayer audioUrl={record.audioUrl} />
          {record.transcript && (
            <Typography variant="body2" sx={{ color: 'var(--text-secondary-dark)' }}>
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
    <Stack
      sx={{ ...LESSON_THEME_VARS, gap: '28px' }}
      data-testid="interactive-lesson-progress"
    >
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
            backgroundColor: 'color-mix(in srgb, var(--accent) 12%, transparent)',
          }}
          data-testid="interactive-lesson-progress-needed"
        >
          <Stack sx={{ gap: '6px' }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {i18n._('Hear how your English changes')}
            </Typography>
            <Typography variant="body1" sx={{ color: 'var(--text-secondary-dark)' }}>
              {recorded === 0
                ? i18n._(
                    'Finish the last speaking task in today’s lesson. We save those free talks, then compare them with your newest ones.',
                  )
                : i18n._(
                    'Nice work — {done} free talks so far. {count} more unlocks a Before / After of your voice.',
                    { done: recorded, count: remaining },
                  )}
            </Typography>
          </Stack>
          <Stack sx={{ gap: '8px' }}>
            <Typography variant="caption" sx={{ color: 'var(--text-secondary-dark)' }}>
              {i18n._('{done} of {goal} free talks', {
                done: recorded,
                goal: PROGRESS_MIN_AUDIO_COUNT,
              })}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progressValue}
              sx={{
                backgroundColor: 'color-mix(in srgb, var(--accent) 20%, transparent)',
                '& .MuiLinearProgress-bar': { backgroundColor: 'var(--accent)' },
              }}
            />
          </Stack>
          <Button
            variant="contained"
            color="info"
            onClick={onContinueLesson}
            data-testid="interactive-lesson-progress-continue"
            sx={{
              ...lessonAccentButtonSx,
              alignSelf: 'flex-start',
              padding: '10px 22px',
            }}
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
