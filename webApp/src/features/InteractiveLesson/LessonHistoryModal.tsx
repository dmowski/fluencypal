'use client';

import { Stack, Typography } from '@mui/material';
import { useLingui } from '@lingui/react';
import { CustomModal } from '@/features/uiKit/Modal/CustomModal';
import { SupportedLanguage } from '@/features/Lang/lang';
import { LessonHistoryView } from './LessonHistoryView';
import { InteractiveLesson } from './types';

export const LessonHistoryModal = ({
  isOpen,
  onClose,
  lessons,
  languageCode,
}: {
  isOpen: boolean;
  onClose: () => void;
  lessons: InteractiveLesson[];
  languageCode: SupportedLanguage;
}) => {
  const { i18n } = useLingui();
  if (!isOpen) return null;

  return (
    <CustomModal isOpen={true} onClose={onClose} data-testid="interactive-lesson-history-modal">
      <Stack sx={{ width: '100%', maxWidth: '800px', gap: '20px', padding: '20px 5px 80px' }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {i18n._('Lesson history')}
        </Typography>
        <LessonHistoryView lessons={lessons} languageCode={languageCode} />
      </Stack>
    </CustomModal>
  );
};
