'use client';

import { useLingui } from '@lingui/react';
import Stack from '@mui/material/Stack';
import { useMemo, useState } from 'react';
import { useAuth } from '@/features/Auth/useAuth';
import {
  getExamCatalogForTargetLanguage,
  isExamCatalogEntry,
  isWritingExamGroup,
} from '@/features/Quiz/exam/examCatalog';
import { ensureManualExam } from '@/features/Quiz/exam/ensureManualExam';
import {
  POLISH_B1_WRITING_EXAM_GROUP,
  resolvePolishB1WritingExam,
} from '@/features/Quiz/exam/polishB1Writing/polishB1WritingCatalog';
import { ensureStateExam } from '@/features/Quiz/exam/statePolishB1/ensureStateExam';
import { useQuizModal } from '@/features/Quiz/useQuizModal';
import { useSettings } from '@/features/Settings/useSettings';
import { SectionHeader } from '../CartsHeader';
import { CardItem, StoreCard } from '@/features/uiKit/Card/StoreCard';
import { WritingVariantPicker } from './WritingVariantPicker';

const EXAMS_PREVIEW_IMAGE =
  'https://storage.googleapis.com/dark-lang.firebasestorage.app/uploadedImages%2FMq2HfU3KrXTjNyOpPXqHSPg5izV2%2F1780773652889-Mq2HfU3KrXTjNyOpPXqHSPg5izV2.png';

export const ExamsDashboardCard = () => {
  const { i18n } = useLingui();
  const auth = useAuth();
  const settings = useSettings();
  const quizModal = useQuizModal();
  const [startingExamId, setStartingExamId] = useState<string | null>(null);
  const [writingPickerOpen, setWritingPickerOpen] = useState(false);
  const [startingWritingVariant, setStartingWritingVariant] = useState<string | null>(null);

  const availableExams = useMemo(
    () => getExamCatalogForTargetLanguage(settings.languageCode),
    [settings.languageCode],
  );

  const startWritingExam = async (variantKey: string, random: boolean) => {
    if (!auth.uid) return;
    setStartingWritingVariant(random ? 'random' : variantKey);
    try {
      const quiz = resolvePolishB1WritingExam(variantKey, random);
      if (!quiz) throw new Error('Writing variant not found');
      await ensureManualExam(auth.uid, quiz);
      setWritingPickerOpen(false);
      quizModal.openQuiz(quiz.id);
    } catch (error) {
      console.error('ExamsDashboardCard: failed to start writing exam', error);
      alert(i18n._('Could not start the exam. Please try again.'));
    } finally {
      setStartingWritingVariant(null);
      setStartingExamId(null);
    }
  };

  const items: CardItem[] = useMemo(
    () =>
      availableExams.map((exam) => ({
        title: exam.title,
        subTitle: `~${exam.estimatedMinutes} min · ${exam.subtitle}`,
        iconName: 'graduation-cap',
        iconBgColor: '#4B5DFF',
        actionButtonTitle:
          startingExamId === exam.id ? i18n._('Starting...') : i18n._('Start'),
        onClick: () => {
          if (!auth.uid || startingExamId || startingWritingVariant) return;

          if (isWritingExamGroup(exam)) {
            setStartingExamId(exam.id);
            setWritingPickerOpen(true);
            return;
          }

          if (!isExamCatalogEntry(exam)) return;

          setStartingExamId(exam.id);
          const ensureExam = exam.isStateExam
            ? () => ensureStateExam(auth.uid!, exam.quiz)
            : () => ensureManualExam(auth.uid!, exam.quiz);
          void ensureExam()
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
    [auth.uid, availableExams, i18n, quizModal, startingExamId, startingWritingVariant],
  );

  if (settings.loading || availableExams.length === 0) {
    return null;
  }

  return (
    <>
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

      <WritingVariantPicker
        group={POLISH_B1_WRITING_EXAM_GROUP}
        open={writingPickerOpen}
        onClose={() => {
          if (startingWritingVariant) return;
          setWritingPickerOpen(false);
          setStartingExamId(null);
        }}
        onSelectVariant={(variantId) => void startWritingExam(variantId, false)}
        onSelectRandom={() => void startWritingExam('', true)}
        startingVariantId={startingWritingVariant}
      />
    </>
  );
};
