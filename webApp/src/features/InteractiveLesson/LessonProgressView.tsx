'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { LessonHistoryView } from './LessonHistoryView';
import { UserAudioPlayer } from './UserAudioPlayer';
import { canShowAudioProgress, remainingAudiosForProgress } from './audioProgress';
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
}: {
  audioProgress: LessonAudioProgress;
  lessons: InteractiveLesson[];
}) => {
  const { i18n } = useLingui();
  const remaining = remainingAudiosForProgress(audioProgress.totalCount);
  const showComparison = canShowAudioProgress(audioProgress.totalCount);

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
        <Typography
          variant="body1"
          sx={{ opacity: 0.85 }}
          data-testid="interactive-lesson-progress-needed"
        >
          {i18n._('Record {count} more answers to see your progress.', { count: remaining })}
        </Typography>
      )}

      <Stack sx={{ gap: '16px' }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {i18n._('Lessons')}
        </Typography>
        <LessonHistoryView lessons={lessons} />
      </Stack>
    </Stack>
  );
};
