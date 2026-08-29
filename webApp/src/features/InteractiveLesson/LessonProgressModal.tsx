'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { LessonProgressView } from './LessonProgressView';
import { InteractiveLesson, LessonAudioProgress } from './types';

export const LessonProgressModal = ({
  isOpen,
  onClose,
  audioProgress,
  lessons,
}: {
  isOpen: boolean;
  onClose: () => void;
  audioProgress: LessonAudioProgress;
  lessons: InteractiveLesson[];
}) => {
  const { i18n } = useLingui();
  if (!isOpen) return null;

  return (
    <CustomModal isOpen={true} onClose={onClose} data-testid="interactive-lesson-progress-modal">
      <Stack sx={{ width: '100%', maxWidth: '800px', gap: '20px', padding: '20px 5px 80px' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {i18n._('Progress')}
        </Typography>
        <LessonProgressView audioProgress={audioProgress} lessons={lessons} />
      </Stack>
    </CustomModal>
  );
};
