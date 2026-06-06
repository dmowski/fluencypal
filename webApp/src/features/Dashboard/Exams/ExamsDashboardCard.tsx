'use client';

import { useLingui } from '@lingui/react';
import Stack from '@mui/material/Stack';
import { useMemo, useState } from 'react';
import { useAuth } from '@/features/Auth/useAuth';
import { getExamCatalogForTargetLanguage } from '@/features/Quiz/exam/examCatalog';
import { ensureManualExam } from '@/features/Quiz/exam/ensureManualExam';
import { useQuizModal } from '@/features/Quiz/useQuizModal';
import { useSettings } from '@/features/Settings/useSettings';
import { SectionHeader } from '../CartsHeader';
import { CardItem, StoreCard } from '@/features/uiKit/Card/StoreCard';

const EXAMS_PREVIEW_IMAGE =
  'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1780773652889-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png';

export const ExamsDashboardCard = () => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const settings = useSettings();
  const quizModal = useQuizModal();
  const [startingExamId, setStartingExamId] = useState<string | null>(null);

  const availableExams = useMemo(
    () => getExamCatalogForTargetLanguage(settings.languageCode),
    [settings.languageCode],
  );

  const items: CardItem[] = useMemo(
    () =>
      availableExams.map((exam) => ({
        title: exam.title,
        subTitle: i18n._('~{minutes} min · {tasks}', {
          minutes: exam.estimatedMinutes,
          tasks: exam.subtitle,
        }),
        iconName: 'graduation-cap',
        iconBgColor: '#4B5DFF',
        actionButtonTitle:
          startingExamId === exam.id ? i18n._('Starting...') : i18n._('Start'),
        onClick: () => {
          if (!auth.uid || startingExamId) return;
          setStartingExamId(exam.id);
          void ensureManualExam(auth.uid, exam.quiz)
            .then(() => {
              quizModal.openQuiz(exam.id);
            })
            .catch((error) => {
              console.error('ExamsDashboardCard: failed to start exam', error);
              alert(i18n._('Could not start the exam. Please try again.'));
            })
            .finally(() => {
              setStartingExamId(null);
            });
        },
      })),
    [auth.uid, availableExams, i18n, quizModal, startingExamId],
  );

  if (settings.loading || availableExams.length === 0) {
    return null;
  }

  return (
    <Stack sx={{ gap: '20px' }} data-testid="exams-dashboard-card">
      <SectionHeader
        title={i18n._('Exams')}
        subTitle={i18n._(
          'Structured practice exams with reading, listening, grammar, and speaking tasks.',
        )}
      />

      <StoreCard
        textColor={'#fff'}
        backgroundColor={'rgba(47, 58, 102, 0.9)'}
        previewImageUrl={EXAMS_PREVIEW_IMAGE}
        label={i18n._('PRACTICE EXAMS')}
        title={i18n._('Test your level with full exams')}
        items={items}
        itemsBackgroundColor={'rgba(32, 32, 36, 0.88)'}
        itemsViewMode={'list'}
      />
    </Stack>
  );
};
